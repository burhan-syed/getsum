import Header from "@/components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center mt-16 mx-auto max-w-4xl px-4">
        home
        <Link href={"/groups/new"}>Create new Group</Link>
      </main>
    </>
  );
}
