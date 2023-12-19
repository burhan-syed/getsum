import { getGroup } from "@/lib/db/queries";

type GroupPageProps = {
  params: {
    groupId: string;
  };
};

export default async function GroupPage({ params }: GroupPageProps) {
  const { group, expenses, members } = await getGroup({ id: params.groupId });

  if (!group.id) {
    return <div>group not found</div>;
  }

  return (
    <>
      <h1>Group {group.name}</h1>
      <div>{group.id}</div>
      <h3>Members</h3>
      <ul>
        {members.map((m) => (
          <li key={m.id}>{m.fullName}</li>
        ))}
      </ul>
      <h3>Expenses</h3>
      <ul>
        {expenses.map((e) => (
          <li key={e.id}>{e.title} (${e.total})</li>
        ))}
      </ul>
    </>
  );
}
