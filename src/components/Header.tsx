import { cn } from "@/lib/utils";
import Link from "next/link";

type HeaderProps = {
  groupName?: string;
  groupId?: string;
};

export default function Header({ groupName }: HeaderProps) {
  return (
    <>
      <header
        className={cn(
          groupName && "hidden sm:block",
          "h-16 fixed top-0 left-0 right-0 border-b"
        )}
      >
        <div className="flex items-center mx-auto max-w-4xl h-full px-4">
          <div className={cn(groupName && "sm:w-36 flex-none pr-2")}>
            <Link href={"/"}>
              <h2>
                <span className="font-semibold opacity-80">Get</span>
                <span className="font-light opacity-80">Sum</span>
              </h2>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
