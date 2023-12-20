import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { createExpense, createExpenseSplits, getGroup } from "@/lib/db/queries";
import { redirect } from "next/navigation";

type ExpenseEditPageProps = {
  params: {
    groupId: string;
  };
};

async function handleNewExpenseAction(data: FormData) {
  "use server";
  const groupId = data.get("groupId")?.valueOf();
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
  if (!title || typeof title !== "string") {
    throw new Error("invalid title");
  }
  if (!total || typeof total !== "number") {
    throw new Error("invalid total");
  }
  if (!groupId || typeof groupId !== "string") {
    throw new Error("invalid group id");
  }
  if (splits.some((s) => typeof s.userId !== "number")) {
    throw new Error("invalid user ids");
  }
  if (splits.some((s) => typeof s.amount !== "number")) {
    throw new Error("invalid split amounts");
  }
  // console.log({title, total, members, splits, e: JSON.stringify(data.entries(), null, 2)})

  const expense = await createExpense({
    groupId,
    title,
    total,
  });
  await createExpenseSplits({
    expenseId: expense[0].id,
    splits,
  });
  redirect(`/groups/${groupId}`);
}

export default async function ExpenseEditPage({
  params,
}: ExpenseEditPageProps) {
  const { group, expenses, members } = await getGroup({ id: params.groupId });

  return (
    <div className="sm:px-4 py-4">
      <h2>Create a new Expense</h2>
      <div className="my-2 sm:my-4"></div>
      <ExpenseForm
        groupId={group.id}
        members={members}
        handleExpenseFormAction={handleNewExpenseAction}
      />
    </div>
  );
}
