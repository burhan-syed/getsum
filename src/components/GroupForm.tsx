"use client";
import { useState } from "react";
import { nanoid } from "nanoid";
import { Button } from "./ui/Button";

type GroupFormProps = {
  handleFormAction: (data: FormData) => Promise<any>;
};

export function GroupForm({ handleFormAction }: GroupFormProps) {
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);

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
    <form action={handleFormAction}>
      <div>
        <label htmlFor="group-name">Group Name:</label>
        <input type="text" id="group-name" name="groupName" required />
      </div>

      {members.map((member, index) => (
        <div key={member.id}>
          <label htmlFor={`member-${member.id}`}>Member Name:</label>
          <input
            type="text"
            id={`member-${member.id}`}
            name="members[]"
            value={member.name}
            onChange={(e) => handleMemberChange(member.id, e.target.value)}
            required
          />
          <button type="button" onClick={() => removeMember(member.id)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={addMember}>
        Add Member
      </button>
      <Button>Create</Button>
    </form>
  );
}
