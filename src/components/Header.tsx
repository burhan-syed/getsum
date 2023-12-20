import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/Button";
import ShareButton from "./ShareButton";

type HeaderProps = {
  groupName?: string;
  groupId?: string;
};

export default function Header({ groupName }: HeaderProps) {
  return (
    <>
      <header className={cn(groupName && "h-16 hidden sm:block fixed top-0 left-0 right-0 border-b")}>
        <div className="flex items-center mx-auto max-w-4xl h-full px-4">
          <div
            className={cn(
              groupName && "sm:w-36 flex-none pr-2"
            )}
          >
            <Link href={"/"}>
              <h2>Logo</h2>
            </Link>
          </div>

          
        </div>
      </header>
    </>
  );
}
