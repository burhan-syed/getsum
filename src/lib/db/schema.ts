import { boolean, date, integer, numeric, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const groups = pgTable("groups", {
  id: varchar("id").primaryKey(),
  name: text("name"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
});

export const usersGroups = pgTable("users_groups", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  groupId: varchar("group_id").references(() => groups.id),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  created: date('created').defaultNow(),
  updated: date('updated').defaultNow(),
  title: text("title").notNull(),
  total: numeric('total').notNull(),
  description: text("description"),
  groupId: varchar("group_id").references(() => groups.id),
  createdBy: integer("created_by").references(() => users.id),
  paidBy: integer("paid_by").references(() => users.id)
});

export const expenseSplits = pgTable("expense_splits", {
  id: serial("id").primaryKey(),
  amount: numeric('total').notNull(),
  settled: boolean('settled').default(false),
  settledDate: date('settled_date'),
  userId: integer('user_id').references(() => users.id),
  expenseId: integer('expense_id').references(() => expenses.id),
});
