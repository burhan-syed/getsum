import { Component, Home, PlusSquare, Settings, Users } from "lucide-react";
import Link from "next/link";

export default function BottomNav({ groupId }: { groupId: string }) {
  return (
    <nav className="h-16 fixed bottom-0 left-0 right-0 sm:hidden shadow-sm bg-white">
      <div className="flex items-center mx-auto px-4 h-full justify-around">
        <Link
          href={"/"}
          className="flex flex-col items-center justify-center w-1/5"
        >
          <Home />
          <span className="text-xs">Home</span>
        </Link>
        <Link
          href={"/groups"}
          className="flex flex-col items-center justify-center w-1/5"
        >
          <Component />
          <span className="text-xs">Groups</span>
        </Link>

        <Link
          href={`/groups/${groupId}/expenses/new`}
          className="flex flex-col items-center justify-center w-1/5"
        >
          <PlusSquare />
          <span className="text-xs text-center">Add</span>
        </Link>
        <Link
          href={`/groups/${groupId}/balances`}
          className="flex flex-col items-center justify-center w-1/5"
        >
          <Users />
          <span className="text-xs">Balances</span>
        </Link>
        <Link
          href={`/groups/${groupId}/edit`}
          className="flex flex-col items-center justify-center w-1/5"
        >
          <Settings />
          <span className="text-xs">Settings</span>
        </Link>
      </div>
    </nav>
  );
}
