import Header from "@/components/Header";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center mt-16 mx-auto max-w-4xl px-4">
        <div className="text-center max-w-md flex flex-col items-center gap-6 my-auto pb-32">
          <h1 className="text-3xl font-bold">
            Group Expense Tracker
            <br />
            and Summarizer
          </h1>
          <p className="opacity-80">
            Keep track of shared expenses with your friends, roommates, and
            family, with tabs on who owes who.
          </p>
          <Button asChild>
            <Link href={"/groups/new"}>Create new Group</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
