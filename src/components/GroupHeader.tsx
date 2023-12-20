import Link from "next/link";
import { Button } from "./ui/Button";
import { Plus } from "lucide-react";
import ShareButton from "./ShareButton";

export default function GroupHeader({
  groupId,
  groupName,
}: {
  groupId: string;
  groupName: string;
}) {
  return (
    <div className="sm:border-l px-4 h-16 flex items-center w-full">
      <h1>{groupName}</h1>
      <div className="ml-auto flex gap-1.5">
        <Button className="hidden sm:flex items-center justify-center gap-1.5" asChild >
          <Link
            href={`/groups/${groupId}/expenses/new`}
          >
            <span className="text-xs text-center">Add Expense</span>
            <Plus size={16} />
          </Link>
        </Button>
        <ShareButton groupId={groupId} groupName={groupName} />
      </div>
    </div>
  );
}
