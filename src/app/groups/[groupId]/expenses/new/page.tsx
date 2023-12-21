import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { createExpense, createExpenseSplits, getGroup } from "@/lib/db/queries";
import { parseExpenseForm } from "@/lib/utils";
import { redirect } from "next/navigation";

type NewExpensePageProps = {
  params: {
    groupId: string;
  };
};

async function handleNewExpenseAction(data: FormData) {
  "use server";
  let eGroupId = "";
  try {
    const { groupId, title, total, paidBy, splits } = parseExpenseForm(data);
    try {
      const expense = await createExpense({
        groupId,
        title,
        total,
        paidBy,
      });
      await createExpenseSplits({
        expenseId: expense[0].id,
        splits,
      });
      eGroupId = groupId;
    } catch (err) {
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

export default async function NewExpensePage({ params }: NewExpensePageProps) {
  const { group, members } = await getGroup({ id: params.groupId });

  return (
    <div className="px-4 py-4">
      <h2 className="font-semibold">Create a new Expense</h2>
      <div className="my-2 sm:my-4"></div>
      <ExpenseForm
        groupId={group.id}
        members={members}
        handleExpenseFormAction={handleNewExpenseAction}
      />
    </div>
  );
}
