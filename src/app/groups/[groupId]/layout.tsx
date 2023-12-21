import type { Metadata } from "next";
import "@/app/globals.css";
import Header from "@/components/Header";
import { getExpenses, getGroup } from "@/lib/db/queries";
import BottomNav from "@/components/BottomNav";
import GroupHeader from "@/components/GroupHeader";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Settings } from "lucide-react";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";

type RouteParams = {
  params: { groupId: string };
};

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { group } = await getGroup({ id: params.groupId });
  return {
    title: group.name,
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
} & RouteParams) {
  const { group, members } = await getGroup({ id: params.groupId });
  const { balances } = await getExpenses({ groupId: params.groupId });

  if (!group?.id) {
    return (
      <>
        <Header />
        <main className="flex min-h-[calc(100vh-4rem)] flex-col mt-16 mx-auto max-w-4xl px-4 py-4 items-center">
          <div className="my-auto pb-32 max-w-lg w-full text-center">
            <h1>Group Not Found</h1>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        groupName={group?.name ?? undefined}
        groupId={group?.id ?? undefined}
      />
      <div className="flex min-h-[calc(100vh-8rem)] sm:min-h-[calc(100vh-4rem)] flex-col items-center sm:mt-16 mb-16 sm:mb-0 mx-auto max-w-4xl">
        <div className="sticky top-0 bg-slate-100 w-full">
          <GroupHeader groupId={group.id} groupName={group.name!} />
        </div>
        <div className="flex flex-row w-full">
          <aside className="w-36 flex-none sticky top-16 self-start  hidden sm:block overflow-hidden">
            <div className="px-2">
              <h3 className="h-8 border-b flex items-center font-semibold">
                <Link href={`/groups/${group.id}/balances`}>Members</Link>
              </h3>
              <ul>
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="text-xs flex justify-between items-center py-1"
                  >
                    <span className="truncate">{m.fullName}</span>
                    {balances[m.id]?.balance && (
                      <div
                        className={cn(
                          balances[m.id].balance >= 0
                            ? "text-green-700"
                            : "text-destructive"
                        )}
                      >
                        {balances[m.id]?.balance?.toFixed(2)}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          <main className="min-h-[calc(100vh-8rem)] w-full sm:shadow-md">
            <div className="flex-none flex-grow sm:border-l">{children}</div>
          </main>
        </div>
      </div>
      {group.id && <BottomNav groupId={group.id} />}
    </>
  );
}
