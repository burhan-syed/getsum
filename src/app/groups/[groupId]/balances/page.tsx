import SettleButton from "@/components/forms/SettleButton";
import { getExpenses, settleExpenses } from "@/lib/db/queries";
import { cn } from "@/lib/utils";
import { revalidatePath } from "next/cache";

type BalancesPageProps = {
  params: {
    groupId: string;
  };
};

async function handleSettleExpenses({
  userId,
  expenseIds,
  groupId,
}: {
  userId: number;
  expenseIds: number[];
  groupId: string;
}) {
  "use server";
  try {
    await settleExpenses({ userId, expenseIds });
    revalidatePath(`/groups/${groupId}`);
  } catch (err) {
    return { error: "something went wrong" };
  }
}

export default async function BalancesPage({ params }: BalancesPageProps) {
  const { balances } = await getExpenses({ groupId: params.groupId });
  type User = { id: number; fullName: string };
  const sums: Record<
    number,
    {
      user: User;
      others: Record<number, { user: User; amount: 0 }>;
    }
  > = {};
  Object.values(balances).map((b) => {
    sums[b.user.id] = {
      user: b.user,
      others: {},
    };
    Object.values(b.debts).forEach((d) => {
      if (!sums[b.user.id].others[d.user.id]) {
        sums[b.user.id].others[d.user.id] = { user: d.user, amount: 0 };
      }
      sums[b.user.id].others[d.user.id].amount -= Math.abs(d.amount);
    });
    Object.values(b.credits).forEach((c) => {
      if (!sums[b.user.id].others[c.user.id]) {
        sums[b.user.id].others[c.user.id] = { user: c.user, amount: 0 };
      }
      sums[b.user.id].others[c.user.id].amount += Math.abs(c.amount);
    });
  });

  return (
    <div className="">
      <h3 className="h-8 border-b sticky top-16 px-4 flex items-center font-semibold">
        Group Balances
      </h3>
      <ul className="divide-y">
        {Object.values(sums).map((s) => (
          <li
            key={`${s.user.id}_balances`}
            className="flex justify-between text-sm p-1 px-4"
          >
            <div className="flex flex-col justify-between">
              <h3>{s.user.fullName}</h3>
              {/* {Object.values(s.others).some((o) => o.amount < 0) && (
                // TODO
                <SettleButton
                  userId={s.user.id}
                  groupId={params.groupId}
                  expenseIds={Object.values(s.others).filter((o) => o.amount < 0).map(s => s.)}
                  handleSubmit={handleSettleExpenses}
                />
              )} */}
            </div>

            <div className="text-right">
              <ul>
                {Object.values(s.others)
                  .sort((a, b) =>
                    a.user.fullName.localeCompare(b.user.fullName)
                  )
                  .map((o) => (
                    <li key={`${o.user.id}_balance_to_${s.user.id}}`}>
                      <span
                        className={cn(
                          o.amount >= 0 ? "text-green-700" : "text-destructive"
                        )}
                      >
                        {Math.abs(o.amount).toFixed(2)}
                      </span>
                      {` owed ${o.amount >= 0 ? "from" : "to"} ${
                        o.user.fullName
                      }`}
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
