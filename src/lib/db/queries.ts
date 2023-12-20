import { eq } from "drizzle-orm";
import db from ".";
import { expenseSplits, expenses, groups, users, usersGroups } from "./schema";
import { nanoid } from "nanoid";

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

export async function getGroup({ id }: { id: string }) {
  const group = await db
    .select()
    .from(groups)
    .leftJoin(usersGroups, eq(usersGroups.groupId, groups.id))
    .leftJoin(users, eq(users.id, usersGroups.userId))
    .leftJoin(expenses, eq(expenses.groupId, groups.id))
    .where(eq(id as any, groups.id));
  console.log('r?', group);
  const formatted = group.reduce<
    Record<string, { group: Group; members: Record<number, Users>; expenses: Record<number, Expenses> }>
  >((acc, row) => {
    const group = row.groups;
    const user = row.users;
    const expense = row.expenses;
    if (!acc[group.id]) {
      acc[group.id] = {
        group,
        members: [],
        expenses: [],
      };
    }
    if (user) {
      acc[group.id].members[user.id] = user
    }
    if (expense) {
      acc[group.id].expenses[expense.id] = expense;
    }
    return acc;
  }, {});
  const formattedArray = Object.values(formatted)[0];
  return {
    group: formattedArray.group,
    members: Object.values(formattedArray.members),
    expenses: Object.values(formattedArray.expenses),
  }
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
  paidBy?: number;
}) {
  return await db.insert(expenses).values({
    groupId,
    title,
    total,
    description,
    createdBy,
    paidBy,
  }).returning();
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
