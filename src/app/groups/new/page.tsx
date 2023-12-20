import Header from "@/components/Header";
import { GroupForm } from "@/components/forms/GroupForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { createGroup } from "@/lib/db/queries";
import { redirect } from "next/navigation";

async function handleGroupCreateForm(data: FormData) {
  "use server";

  const groupName = data.get("groupName")?.valueOf();
  const members = data.getAll("members[]") as string[];
  if (!groupName || typeof groupName !== "string") {
    throw new Error("invalid group name");
  }
  if (members && members.some((m) => typeof m !== "string")) {
    throw new Error("invalid member names");
  }
  const group = await createGroup({ groupName, members });
  redirect(`/groups/${group.id}`);
}

export default function GroupsNewPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-4rem)] flex-col mt-16 mx-auto max-w-4xl px-4 py-4">
        <h1>Create New Group</h1>
        <div className="my-4"></div>
        <GroupForm handleFormAction={handleGroupCreateForm} />
      </main>
    </>
  );
}
