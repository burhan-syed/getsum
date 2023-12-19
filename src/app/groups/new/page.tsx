import { GroupForm } from "@/components/GroupForm";
import { createGroup } from "@/lib/db/queries";
import { redirect } from "next/navigation";

async function handleGroupCreateForm(data: FormData) {
  "use server";

  const groupName = data.get("groupName")?.valueOf();
  const members = data.getAll("members[]") as string[];
  if (!groupName || typeof groupName !== "string") {
    throw new Error("invalid group name");
  }
  if(members && members.some(m => typeof m !== "string")) {
    throw new Error("invalid member names")
  }
  const group = await createGroup({ groupName, members });
  redirect(`/groups/${group.id}`);
}

export default function GroupsNewPage() {
  return (
    <>
      <GroupForm handleFormAction={handleGroupCreateForm}/>
    </>
  );
}
