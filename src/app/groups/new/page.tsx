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
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="sm:w-3/4">
        <CardHeader>
          <CardTitle>Create a New Group</CardTitle>
        </CardHeader>
        <CardContent>
          <GroupForm handleFormAction={handleGroupCreateForm} />
        </CardContent>
      </Card>
    </main>
  );
}
