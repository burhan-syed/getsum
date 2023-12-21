import Link from "next/link";
import { Button } from "./ui/Button";
import { Plus, Settings } from "lucide-react";
import ShareButton from "./ShareButton";

export default function GroupHeader({
  groupId,
  groupName,
}: {
  groupId: string;
  groupName: string;
}) {
  return (
    <div className="px-4 h-16 flex items-center w-full z-10 relative">
      <h1 className="font-bold text-lg"><Link href={`/groups/${groupId}`}>{groupName}</Link></h1>
      <div className="ml-auto flex gap-1.5">
        <Button asChild variant={"ghost"} className="hidden sm:flex">
          <Link href={`/groups/${groupId}/edit`}>
            <Settings size={16} />
          </Link>
        </Button>
        <Button
          className="hidden sm:flex items-center justify-center gap-1.5"
          asChild
        >
          <Link href={`/groups/${groupId}/expenses/new`}>
            <span className="text-xs text-center">Add Expense</span>
            <Plus size={16} />
          </Link>
        </Button>
        <ShareButton groupId={groupId} groupName={groupName} />
      </div>
    </div>
  );
}
