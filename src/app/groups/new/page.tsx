import Header from "@/components/Header";
import { GroupForm } from "@/components/forms/GroupForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { createGroup } from "@/lib/db/queries";
import { parseGroupForm } from "@/lib/utils";
import { redirect } from "next/navigation";

async function handleGroupCreateForm(data: FormData) {
  "use server";
  let groupId = "";
  try {
    const { groupName, members } = parseGroupForm(data);
    try {
      const group = await createGroup({
        groupName,
        members: members.map((m) => m.name + ""),
      });
      groupId = group.id;
    } catch (err) {
      return { error: "something went wrong" };
    }
  } catch (err: any) {
    return { error: err?.message ?? "something went wrong" };
  } finally {
    if (groupId) {
      redirect(`/groups/${groupId}`);
    }
  }
}

export default function GroupsNewPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-4rem)] flex-col mt-16 mx-auto max-w-4xl px-4 py-4 items-center">
        <div className="my-auto pb-32 max-w-lg w-full">
          <h1>Create New Group</h1>
          <div className="my-4"></div>
          <GroupForm handleFormAction={handleGroupCreateForm} />
        </div>
      </main>
    </>
  );
}
