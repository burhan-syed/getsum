import { Button } from "@/components/ui/Button";
import { getExpenses, getGroup } from "@/lib/db/queries";
import Link from "next/link";

type GroupPageProps = {
  params: {
    groupId: string;
  };
};

export default async function GroupPage({ params }: GroupPageProps) {
  const { group, members } = await getGroup({ id: params.groupId });
  const { expenses } = await getExpenses({ groupId: params.groupId });
  if (!group.id) {
    return <div>group not found</div>;
  }

  return (
    <>
      <h3 className="h-8 border-b sticky top-16 px-4 flex items-center font-semibold">
        Expenses
      </h3>
      <ul className="divide-y-2 border-b">
        {expenses.map(({expense: e}) => (
          <li key={e.id}>
            <Link
              href={`/groups/${group.id}/expenses/${e.id}`}
              className="h-14 p-0.5 px-4 flex items-center gap-2 hover:bg-gradient-to-b from-transparent via-transparent to-black/5 cursor-pointer group text-sm "
            >
              <div className="text-sm opacity-50">
                <span>{e.created?.getMonth()}</span>/
                <span>{e.created?.getDate()}</span>
              </div>
              <h4 className="group-hover:underline">{e.title}</h4>
              <div className="ml-auto flex flex-col items-end">
                <span className="text-xs">{e?.paidBy?.fullName}</span>
                <span>USD{e.total.toFixed(2)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
