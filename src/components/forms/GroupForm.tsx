"use client";
import { useState, useEffect, type FormEvent } from "react";
import { nanoid } from "nanoid";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import Link from "next/link";
import { Loader, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type GroupFormProps = {
  handleFormAction: (data: FormData) => Promise<any>;
  data?: {
    id: string;
    groupName: string;
    members: {
      id: number;
      name: string;
    }[];
  };
};

export function GroupForm({ handleFormAction, data }: GroupFormProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [groupName, setGroupName] = useState(data?.groupName ?? "");
  const [members, setMembers] = useState<{ id: string; name: string }[]>(
    data?.members?.map((m) => ({ id: m.id.toString(), name: m.name })) ?? []
  );
  useEffect(() => {
    setMembers((m) =>
      m.length === 0
        ? [
            ...m,
            {
              id: nanoid(),
              name: "",
            },
          ]
        : m
    );
  }, []);

  const addMember = () => {
    setMembers((m) => [...m, { id: nanoid(), name: "" }]);
  };

  const removeMember = (id: string) => {
    setMembers((m) => m.filter((m) => m.id !== id));
  };

  const handleMemberChange = (id: string, value: string) => {
    setMembers((m) => m.map((v) => (v.id === id ? { ...v, name: value } : v)));
  };

  const formAction = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      setLoading(true);
      const res = await handleFormAction(formData);
      if (res && res?.error) {
        setErrorMessage(res.error);
      }
    } catch (err) {
      setErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="groupId" value={data?.id} />
      <div>
        <Label htmlFor="group-name">Group Name:</Label>
        <Input
          type="text"
          id="group-name"
          name="groupName"
          required
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div>
          {members.map((member, index) => (
            <div key={member.id}>
              <Label htmlFor={`member-${member.id}`}>Member Name:</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  id={`member-${member.id}`}
                  name={`members[]-${member.id}`}
                  value={member.name}
                  onChange={(e) =>
                    handleMemberChange(member.id, e.target.value)
                  }
                  required
                />
                <Button
                  type="button"
                  variant={"destructive"}
                  onClick={() => removeMember(member.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button type="button" variant={"secondary"} onClick={addMember}>
          Add Member
        </Button>
      </div>

      {errorMessage && (
        <span className="py-1 text-destructive text-xs">{errorMessage}</span>
      )}

      <div className="flex flex-row gap-2">
        <Button disabled={loading} className={cn(loading && "opacity-80")}>
          {loading && (
            <div className="animate-spin absolute">
              <Loader size={14} />
            </div>
          )}
          <span className={cn(loading && "opacity-0")}>
            {data?.id ? "Update" : "Create"}
          </span>
        </Button>
        <Button asChild type="button" variant={"outline"}>
          <Link href={data?.id ? `/groups/${data.id}` : ".."}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
