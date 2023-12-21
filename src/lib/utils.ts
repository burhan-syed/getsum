import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseExpenseForm(data: FormData) {
  const groupId = data.get("groupId")?.valueOf();
  const expenseId = Number(data.get("expenseId")?.valueOf());
  const title = data.get("title")?.valueOf();
  const total = Number(data.get("total")?.valueOf());
  const members = [...data.entries()]
    .filter(([k, v]) => k.substring(0, 9) === "members[]")
    .map(([k, v]) => Number(k.split("-")[1]));
  const splits = [...data.entries()]
    .filter(([k, v]) => k.substring(0, 8) === "splits[]")
    .map(([k, v]) => ({
      userId: Number(k.split("-")[1]),
      amount: Number(v),
    }));
  const paidBy = Number(data.get("paidBy")?.valueOf());
  if (!title || typeof title !== "string") {
    throw new Error("invalid title");
  }
  if (!total || typeof total !== "number") {
    throw new Error("invalid total");
  }
  if (!groupId || typeof groupId !== "string") {
    throw new Error("invalid group id");
  }
  if (!paidBy || typeof paidBy !== "number") {
    throw new Error("invalid paid by");
  }
  if (splits.some((s) => typeof s.userId !== "number")) {
    throw new Error("invalid user ids");
  }
  if (splits.some((s) => typeof s.amount !== "number")) {
    throw new Error("invalid split amounts");
  }
  if (splits.reduce((acc, s) => (acc += s.amount), 0) !== total) {
    throw new Error("splits sum must equal total");
  }
  // console.log({title, total, members, splits, e: JSON.stringify(data.entries(), null, 2)})

  return {
    groupId,
    expenseId,
    title,
    total,
    members,
    splits,
    paidBy,
  };
}

export function parseGroupForm(data: FormData) {
  const groupId = data.get("groupId")?.valueOf();
  const groupName = data.get("groupName")?.valueOf();
  const members = [...data.entries()]
    .filter(([k, v]) => k.substring(0, 9) === "members[]")
    .map(([k, v]) => ({ id: Number(k.split("-")[1]), name: v }));
  if (!groupName || typeof groupName !== "string" || groupName.length < 2) {
    throw new Error("invalid group name");
  }
  if (
    members &&
    members.some((m) => typeof m.name !== "string" || m.name.length < 2)
  ) {
    throw new Error("invalid member names");
  }
  if (!members || members.length < 1) {
    throw new Error("group must have member(s)");
  }

  return {
    groupId,
    groupName,
    members,
  };
}

export class UserError extends Error {
  constructor(message: string) {
    // Calling the super constructor with the error message
    super(message);

    // Set the name of the custom error
    this.name = 'UserError';

    // Capture the stack trace, excluding the constructor call
    Error.captureStackTrace(this, UserError);
  }
}
