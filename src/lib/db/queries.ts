import { eq, or } from "drizzle-orm";
import db from ".";
import { expenseSplits, expenses, groups, users, usersGroups } from "./schema";
import { nanoid } from "nanoid";
import { alias } from "drizzle-orm/pg-core";
import { UserError } from "../utils";

type Group = typeof groups.$inferSelect;
type Users = typeof users.$inferSelect;
type Expenses = typeof expenses.$inferSelect;
type ExpenseSplits = typeof expenseSplits.$inferSelect;

export async function createGroup({
  groupName,
  members,
}: {
  groupName: string;
  members?: string[];
}) {
  const insert = await db.transaction(async (tx) => {
    const group = (
      await tx
        .insert(groups)
        .values([
          {
            id: nanoid(),
            name: groupName,
          },
        ])
        .returning()
    )[0];
    if (members && members.length > 0) {
      const userInserts = await tx
        .insert(users)
        .values(members.map((member) => ({ fullName: member })))
        .returning();
      await tx.insert(usersGroups).values(
        userInserts.map((ui) => ({
          userId: ui.id,
          groupId: group.id,
        }))
      );
    }
    return group;
  });
  return insert;
}

export async function updateGroup({
  groupId,
  groupName,
  members,
}: {
  groupId: string;
  groupName: string;
  members?: { id?: number; name: string }[];
}) {
  const { balances } = await getExpenses({ groupId });
  Object.values(balances).forEach((b) => {
    if (b.balance !== 0 && !members?.find((m) => m.id === b.user.id)) {
      throw new UserError(`cannot remove ${b.user.fullName} due to outstanding balance`);
    }
  })
  await db.transaction(async (tx) => {
    const nameUpdate = tx
      .update(groups)
      .set({ name: groupName })
      .where(eq(groupId as any, groups.id));
    const prevMembers = await tx
      .select()
      .from(usersGroups)
      .where(eq(groupId as any, usersGroups.groupId));
    const membersToRemove = prevMembers.filter(
      (pm) => !members?.find((m) => m.id === pm.userId)
    );
    if (membersToRemove.length > 0) {
      await tx
        .delete(usersGroups)
        .where(
          or(...membersToRemove.map((m) => eq(m.id as any, usersGroups.id)))
        );
    }
    if (members) {
      const updateMembers = members.filter((m) => m.id);
      await Promise.allSettled(
        updateMembers.map(async (member) => {
          await tx
            .update(users)
            .set({ fullName: member.name })
            .where(eq(member.id as any, users.id));
        })
      );
      const newMembers = members.filter((m) => !m.id);
      if (newMembers.length > 0) {
        const userInserts = await tx
          .insert(users)
          .values(newMembers.map((member) => ({ fullName: member.name })))
          .returning();
        await tx.insert(usersGroups).values(
          userInserts.map((ui) => ({
            userId: ui.id,
            groupId: groupId,
          }))
        );
      }
    }
    await nameUpdate;
  });
}

export async function getGroup({ id }: { id: string }) {
  const members = alias(users, "members");
  const group = await db
    .select()
    .from(groups)
    .leftJoin(usersGroups, eq(usersGroups.groupId, groups.id))
    .leftJoin(members, eq(usersGroups.userId, members.id))
    .where(eq(id as any, groups.id));

  const formatted = group.reduce<
    Record<
      string,
      {
        group: Group;
        members: Record<number, Users>;
      }
    >
  >((acc, row) => {
    const group = row.groups;
    const member = row.members;
    if (!acc[group.id]) {
      acc[group.id] = {
        group,
        members: [],
      };
    }
    if (member) {
      acc[group.id].members[member.id] = member;
    }
    return acc;
  }, {});
  const formattedArray = Object.values(formatted)[0];
  return {
    group: formattedArray?.group,
    members: Object.values(formattedArray?.members ?? {}),
  };
}

export async function createExpense({
  groupId,
  title,
  total,
  description,
  createdBy,
  paidBy,
}: {
  groupId: string;
  title: string;
  total: number;
  description?: string;
  createdBy?: number;
  paidBy: number;
}) {
  return await db
    .insert(expenses)
    .values({
      groupId,
      title,
      total,
      description,
      createdBy,
      paidBy,
    })
    .returning();
}

export async function getExpenses({ groupId }: { groupId: string }) {
  const paidBy = alias(users, "paidBy");
  const data = await db
    .select()
    .from(expenses)
    .leftJoin(paidBy, eq(expenses.paidBy, paidBy.id))
    .leftJoin(expenseSplits, eq(expenseSplits.expenseId, expenses.id))
    .leftJoin(users, eq(expenseSplits.userId, users.id))
    .where(eq(expenses.groupId, groupId));

  type ExpensesD = {
    [K in keyof Expenses]: K extends "paidBy"
      ? { id: number; fullName: string } | undefined
      : Expenses[K];
  };

  const formatted = data.reduce<
    Record<
      number,
      {
        expense: ExpensesD;
        splits: Record<number, ExpenseSplits>;
        participants: Record<number, Users>;
      }
    >
  >((acc, row) => {
    const expense = row.expenses;
    const paidBy = row.paidBy ?? undefined;
    const split = row.expense_splits;
    const user = row.users;
    if (!acc[expense.id]) {
      acc[expense.id] = {
        expense: { ...expense, paidBy },
        splits: {},
        participants: {},
      };
    }
    if (split) {
      acc[expense.id].splits[split.id] = split;
    }
    if (user) {
      acc[expense.id].participants[user.id] = user;
    }
    return acc;
  }, {});

  const asArray = Object.values(formatted).map((a) => ({
    ...a,
    splits: Object.values(a.splits),
    participants: Object.values(a.participants),
  }));

  const balances = asArray.reduce<
    Record<
      number,
      {
        user: Users;
        balance: number;
        debts: Record<
          number,
          {
            user: Users;
            amount: number;
            expenses: Record<number, { expense: ExpensesD; split: number }>;
          }
        >;
        credits: Record<
          number,
          {
            user: Users;
            amount: number;
            expenses: Record<number, { expense: ExpensesD; split: number }>;
          }
        >;
      }
    >
  >((acc, row) => {
    const { total, paidBy } = row.expense;
    let totalOwed = total;
    if (paidBy && !acc[paidBy.id]) {
      acc[paidBy.id] = {
        user: paidBy,
        balance: 0.0,
        debts: {},
        credits: {},
      };
    }
    row.splits
      .filter((split) => !split.settled)
      .forEach((split) => {
        const user = row.participants.find((p) => p.id === split.userId);
        if (user) {
          if (!acc[user.id]) {
            acc[user.id] = {
              user: user,
              balance: 0.0,
              debts: {},
              credits: {},
            };
          }
          if (paidBy && paidBy.id === user.id) {
            totalOwed -= split.amount;
          } else if (paidBy) {
            acc[paidBy.id].balance += split.amount;
            acc[user.id].balance -= split.amount;
            if (!acc[paidBy.id].credits[user.id]) {
              acc[paidBy.id].credits[user.id] = {
                user,
                amount: 0,
                expenses: {},
              };
            }
            acc[paidBy.id].credits[user.id].amount += split.amount;
            acc[paidBy.id].credits[user.id].expenses[row.expense.id] = {
              expense: row.expense,
              split:
                (acc[paidBy.id].credits[user.id].expenses[row.expense.id]
                  ?.split ?? 0) + split.amount,
            };
            if (!acc[user.id].debts[paidBy.id]) {
              acc[user.id].debts[paidBy.id] = {
                user: paidBy,
                amount: 0,
                expenses: {},
              };
            }
            acc[user.id].debts[paidBy.id].amount -= split.amount;
            acc[user.id].debts[paidBy.id].expenses[row.expense.id] = {
              expense: row.expense,
              split: split.amount,
            };
          }
        }
      });
    return acc;
  }, {});
  return {
    expenses: asArray,
    balances,
  };
}

export async function getExpense({ expenseId }: { expenseId: number }) {
  const expense = await db
    .select()
    .from(expenses)
    .leftJoin(expenseSplits, eq(expenseSplits.expenseId, expenses.id))
    .where(eq(expenseId as any, expenses.id));
  const formatted = expense.reduce<
    Record<number, { expense: Expenses; splits: ExpenseSplits[] }>
  >((acc, val) => {
    const expense = val.expenses;
    const splits = val.expense_splits;
    if (!acc[expense.id]) {
      acc[expense.id] = {
        expense,
        splits: [],
      };
    }
    if (splits) {
      acc[expense.id].splits.push(splits);
    }
    return acc;
  }, {});
  return Object.values(formatted)[0];
}

export async function createExpenseSplits({
  expenseId,
  splits,
}: {
  expenseId: number;
  splits?: {
    amount: number;
    userId: number;
    settled?: boolean;
    settledDate?: Date;
  }[];
}) {
  await db.transaction(async (tx) => {
    //clear prior items
    await tx
      .delete(expenseSplits)
      .where(eq(expenseId as any, expenseSplits.expenseId));
    //insert new items
    if (splits && splits.length > 0) {
      await tx.insert(expenseSplits).values(
        splits.map((split) => ({
          ...split,
          expenseId: expenseId,
        }))
      );
    }
  });
}

export async function updateExpense({
  expenseId,
  title,
  total,
  description,
  paidBy,
}: {
  expenseId: number;
  title: string;
  total: number;
  description?: string;
  paidBy: number;
}) {
  await db
    .update(expenses)
    .set({
      title,
      total,
      description,
      paidBy,
      updated: new Date(),
    })
    .where(eq(expenseId as any, expenses.id));
}

export async function deleteExpense({ expenseId }: { expenseId: number }) {
  await db.transaction(async (tx) => {
    await tx
      .delete(expenseSplits)
      .where(eq(expenseSplits.expenseId, expenseId));
    await tx.delete(expenses).where(eq(expenses.id, expenseId));
  });
}
