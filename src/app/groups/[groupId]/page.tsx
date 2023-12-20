import { Button } from "@/components/ui/Button";
import { getGroup } from "@/lib/db/queries";
import Link from "next/link";

type GroupPageProps = {
  params: {
    groupId: string;
  };
};

export default async function GroupPage({ params }: GroupPageProps) {
  const { group, expenses, members } = await getGroup({ id: params.groupId });

  if (!group.id) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        group not found
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1>Group {group.name}</h1>
      <div>{group.id}</div>
      {/* <h3>Members</h3> */}
      {/* <ul>
        {members.map((m) => (
          <li key={m.id}>{m.fullName}</li>
        ))}
      </ul> */}
      <h3>Expenses</h3>
      <ul>
        {expenses.map((e) => (
          <li key={e.id}>
            {e.title} (${e.total})
          </li>
        ))}
      </ul>
      <Link href={`/groups/${group.id}/expenses/new`}>
        <Button>Add Expense</Button>
      </Link>
    </main>
  );
}
