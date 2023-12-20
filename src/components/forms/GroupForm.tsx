"use client";
import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import Link from "next/link";
import { Trash2 } from "lucide-react";

type GroupFormProps = {
  handleFormAction: (data: FormData) => Promise<any>;
};

export function GroupForm({ handleFormAction }: GroupFormProps) {
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
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

  return (
    <form action={handleFormAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="group-name">Group Name:</Label>
        <Input type="text" id="group-name" name="groupName" required />
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
                  name="members[]"
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

      <div className="flex flex-row gap-2">
        <Button>Create</Button>
        <Link href={".."}>
          <Button type="button" variant={"outline"}>
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
