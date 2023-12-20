"use client";
import { useState } from "react";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { Input } from "../ui/Input";
import Link from "next/link";
import { Checkbox } from "../ui/Checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";

type ExpenseFormProps = {
  groupId: string;
  members: {
    id: number;
    fullName: string;
  }[];
  handleExpenseFormAction: (data: FormData) => Promise<any>;
};

export function ExpenseForm({
  groupId,
  members,
  handleExpenseFormAction,
}: ExpenseFormProps) {
  const [total, setTotal] = useState<number>(0);
  const [selectedMembers, setSelectedMembers] = useState<number[]>(() =>
    members.map((m) => m.id)
  );
  return (
    <form action={handleExpenseFormAction} className="flex flex-col gap-4">
      <input type="hidden" name="groupId" value={groupId} required />
      <div>
        <Label htmlFor="expense-title">Title</Label>
        <Input type="text" id="expense-title" name="title" required />
      </div>
      <div>
        <Label htmlFor="expense-total">Total</Label>
        <Input
          type="number"
          id="expense-total"
          name="total"
          required
          value={total}
          onChange={(e) => setTotal(+(e.target.value || ""))}
        />
      </div>
      <h4>Members</h4>
      <div className="flex flex-row items-center gap-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-1">
            <Checkbox
              id={`select-${member.id}`}
              name={`members[]-${member.id}`}
              checked={selectedMembers.includes(member.id)}
              onCheckedChange={(c) => {
                if (c) {
                  setSelectedMembers((m) => [...m, member.id]);
                } else {
                  setSelectedMembers((m) => m.filter((m) => m !== member.id));
                }
              }}
            />
            <Label htmlFor={`select-${member.id}`}>{member.fullName}</Label>
          </div>
        ))}
      </div>
      <div>
        <Label htmlFor="paid-by">Paid By</Label>
        <Select name="paidBy">
          <SelectTrigger>
            <SelectValue placeholder={"Select Name"} />
          </SelectTrigger>
          <SelectContent id="paid-by">
            {members
              .filter(({ id }) => selectedMembers.includes(id))
              .map((member) => (
                <SelectItem key={member.id} value={member.id.toString()}>
                  {member.fullName}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {/* <select id="paid-by" name="paidBy">
          {members
            .filter(({ id }) => selectedMembers.includes(id))
            .map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName}
              </option>
            ))}
        </select> */}
      </div>
      <div>
        <h4>Splits</h4>
        {members
          .filter(({ id }) => selectedMembers.includes(id))
          .map((member) => (
            <div key={`splits-${member.id}`}>
              <Label htmlFor={`split-${member.id}`}>{member.fullName}</Label>
              <Input
                id={`split-${member.id}`}
                name={`splits[]-${member.id}`}
                type="number"
                min={0}
                required
              />
            </div>
          ))}
      </div>

      <div className="flex flex-row gap-2">
        <Button>Create</Button>
        <Button asChild type="button" variant={"outline"}>
          <Link href={".."}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
