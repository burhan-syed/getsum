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
    <>
      <div>{group.id}</div>
      <h3>Expenses</h3>
      <ul>
        {expenses.map((e) => (
          <li key={e.id}>
            {e.title} (${e.total})
          </li>
        ))}
        {[...new Array(100)]
          .fill(0)
          .map((_, i) => i)
          .map((v) => (
            <li key={v}>row {v}</li>
          ))}
      </ul>
    </>
  );
}
