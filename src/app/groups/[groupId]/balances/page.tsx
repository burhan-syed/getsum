import SettleButton from "@/components/forms/SettleButton";
import { getExpenses, settleExpenses } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";

type BalancesPageProps = {
  params: {
    groupId: string;
  };
};

async function handleSettleExpenses({
  userId,
  groupId,
}: {
  userId: number;
  groupId: string;
}) {
  "use server";
  try {
    await settleExpenses({ userId, groupId });
    revalidatePath(`/groups/${groupId}`);
  } catch (err) {
    return { error: "something went wrong" };
  }
}

export default async function BalancesPage({ params }: BalancesPageProps) {
  const { balances } = await getExpenses({ groupId: params.groupId });
  return (
    <div className="">
      <h3 className="h-8 border-b sticky top-16 px-4 flex items-center font-semibold">
        Group Balances
      </h3>
      <ul className="divide-y">
        {Object.values(balances).map((b) => (
          <li
            key={`${b.user.id}_balances`}
            className="flex justify-between text-sm p-1 px-4"
          >
            <div className="flex flex-col justify-between">
              <h3>{b.user.fullName}</h3>
              {Object.values(b.debts).length > 0 && (
                <SettleButton
                  userId={b.user.id}
                  groupId={params.groupId}
                  handleSubmit={handleSettleExpenses}
                />
              )}
            </div>

            <div className="text-right">
              <ul>
                {Object.values(b.debts).map((d) => (
                  <li key={`${d.user.id}_debt_${d.amount}`}>
                    <span className="text-destructive">
                      {d.amount.toFixed(2)}
                    </span>{" "}
                    owed to {d.user.fullName}
                  </li>
                ))}
              </ul>
              <ul>
                {Object.values(b.credits).map((c) => (
                  <li key={`${c.user.id}_credit_${c.amount}`}>
                    <span className="text-green-700">
                      {c.amount.toFixed(2)}
                    </span>{" "}
                    owed by {c.user.fullName}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
