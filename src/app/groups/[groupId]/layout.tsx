import type { Metadata } from "next";
import "@/app/globals.css";
import Header from "@/components/Header";
import { getGroup } from "@/lib/db/queries";
import BottomNav from "@/components/BottomNav";
import GroupHeader from "@/components/GroupHeader";

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
  return (
    <>
      <Header
        groupName={group?.name ?? undefined}
        groupId={group?.id ?? undefined}
      />
      <div className="flex min-h-[calc(100vh-8rem)] sm:min-h-[calc(100vh-4rem)] flex-col items-center sm:mt-16 mb-16 sm:mb-0 mx-auto max-w-4xl">
        <div className="flex flex-row w-full">
          <aside className="w-36 flex-none sticky top-16 self-start pr-2 hidden sm:block">
            groups
            <div>
              <h3>Members</h3>
              <ul>
                {members.map((m) => (
                  <li key={m.id}>{m.fullName}</li>
                ))}
              </ul>
            </div>
          </aside>
          <main className="min-h-[calc(100vh-4rem)] w-full sm:shadow-md">
            <div className="sticky top-0 bg-white">
              <GroupHeader groupId={group.id} groupName={group.name!} />
            </div>
            <div className="flex-none flex-grow sm:border-l px-4 sm:pr-0 ">
              {children}
            </div>
          </main>
        </div>
      </div>
      {group.id && <BottomNav groupId={group.id} />}
    </>
  );
}
