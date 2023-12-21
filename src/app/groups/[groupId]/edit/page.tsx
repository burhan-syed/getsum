import { GroupForm } from "@/components/forms/GroupForm";
import { getGroup, updateGroup } from "@/lib/db/queries";
import { UserError, parseGroupForm } from "@/lib/utils";
import { redirect } from "next/navigation";

type GroupEditPageProps = {
  params: {
    groupId: string;
  };
};

async function handleGroupUpdateForm(data: FormData) {
  "use server";
  let eGroupId = "";
  try {
    const { groupName, members, groupId } = parseGroupForm(data);
    if (!groupId || typeof groupId !== "string") {
      return { error: "invalid group id" };
    }
    try {
      const tMembers = members.map((m) => {
        const idN = Number(m.id);
        return {
          id: typeof idN === "number" && !isNaN(idN) ? idN : undefined,
          name: m.name + "",
        };
      });
      await updateGroup({
        groupId: groupId,
        groupName,
        members: tMembers,
      });
      eGroupId = groupId;
    } catch (err) {
      if (err instanceof UserError) {
        return { error: err.message };
      }
      return { error: "something went wrong" };
    }
  } catch (err: any) {
    return { error: err?.message ?? "something went wrong" };
  } finally {
    if (eGroupId) {
      redirect(`/groups/${eGroupId}`);
    }
  }
}

export default async function GroupEditPage({ params }: GroupEditPageProps) {
  const { group, members } = await getGroup({ id: params.groupId });
  if (!group?.id) {
    return <div>group not found</div>;
  }

  return (
    <div className="px-4 py-4">
      <h2 className="font-semibold">Edit Group</h2>
      <div className="my-2 sm:my-4"></div>
      <GroupForm
        data={{
          id: group.id,
          groupName: group.name!,
          members: members.map((m) => ({ id: m.id, name: m.fullName })),
        }}
        handleFormAction={handleGroupUpdateForm}
      />
    </div>
  );
}
