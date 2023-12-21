import { ExpenseForm } from "@/components/forms/ExpenseForm";
import {
  createExpenseSplits,
  deleteExpense,
  getExpense,
  getGroup,
  updateExpense,
} from "@/lib/db/queries";
import { parseExpenseForm } from "@/lib/utils";
import { redirect } from "next/navigation";

type ExpensePageProps = {
  params: {
    groupId: string;
    expenseId: string;
  };
};

async function handleUpdateExpenseAction(data: FormData) {
  "use server";
  let eGroupId = "";
  try {
    const { groupId, expenseId, title, total, paidBy, splits } =
      parseExpenseForm(data);
    try {
      if (!expenseId || typeof expenseId !== "number") {
        throw new Error("invalid expense id");
      }
      await updateExpense({
        expenseId,
        paidBy,
        title,
        total,
      });
      await createExpenseSplits({
        expenseId,
        splits,
      });
      eGroupId = groupId;
    } catch (error) {
      console.error(error);
      return { error: "there was an error" };
    }
  } catch (err: any) {
    return { error: err?.message ?? "something went wrong" };
  } finally {
    // redirect in trycatch workaround https://github.com/vercel/next.js/issues/49298#issuecomment-1542055642
    if (eGroupId) {
      redirect(`/groups/${eGroupId}`);
    }
  }
}

async function handleDeleteAction({
  expenseId,
  groupId,
}: {
  expenseId: number;
  groupId: string;
}) {
  "use server";
  await deleteExpense({ expenseId });
  redirect(`/groups/${groupId}`);
}

export default async function ExpensePage({ params }: ExpensePageProps) {
  const { group, members } = await getGroup({ id: params.groupId });
  const { expense, splits } = await getExpense({
    expenseId: +params.expenseId,
  });
  return (
    <div className="px-4 py-4">
      <h2 className="font-semibold">Edit an Expense</h2>
      <div className="my-2 sm:my-4"></div>
      <ExpenseForm
        groupId={group.id}
        members={members}
        handleExpenseFormAction={handleUpdateExpenseAction}
        handleDeleteAction={handleDeleteAction}
        data={{
          id: expense.id,
          title: expense.title,
          paidBy: expense.paidBy,
          total: expense.total,
          splits,
        }}
      />
    </div>
  );
}
