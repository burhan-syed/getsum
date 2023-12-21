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
  handleDeleteAction?: (d: {
    expenseId: number;
    groupId: string;
  }) => Promise<any>;
  data?: {
    id: number;
    title: string;
    total: number;
    paidBy: number;
    splits: { userId: number; amount: number }[];
  };
};

export function ExpenseForm({
  groupId,
  members,
  handleDeleteAction,
  handleExpenseFormAction,
  data,
}: ExpenseFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [title, setTitle] = useState(data?.title ?? "");
  const [total, setTotal] = useState<number>(data?.total ?? 0);
  const [paidBy, setPaidBy] = useState<string | undefined>(
    data?.paidBy?.toString() ?? undefined
  );
  const [splits, setSplits] = useState<{
    [userId: number]: { userId: number; amount: number };
  }>(
    data?.splits?.reduce(
      (acc: { [userId: number]: { userId: number; amount: number } }, r) => {
        if (r.userId) {
          acc[r.userId] = r;
        }

        return acc;
      },
      {}
    ) ?? {}
  );
  const [selectedMembers, setSelectedMembers] = useState<number[]>(
    () => data?.splits?.map((s) => s.userId) ?? members.map((m) => m.id)
  );

  const handleSplitChange = (userId: number, value: number) => {
    // console.log("h?", {userId, value}, splits[userId]);
    const s = {...splits, [userId]: {userId, amount: value}};
    setSplits(s);
    // setSplits((s) => {
    //   s[userId] = { userId: userId, amount: value };
    //   return s;
    // });
  };

  const formAction = async(formData: FormData) => {
    const res = await handleExpenseFormAction(formData);
    if (res && res?.error) {
      setErrorMessage(res.error);
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="groupId" value={groupId} required />
      <input type="hidden" name="expenseId" value={data?.id} />

      <div>
        <Label htmlFor="expense-title">Title</Label>
        <Input
          type="text"
          id="expense-title"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
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
      <h4>Participants</h4>
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
        <Select
          name="paidBy"
          value={paidBy}
          onValueChange={(v) => setPaidBy(v)}
        >
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
                value={splits?.[member.id]?.amount}
                onChange={(e) => handleSplitChange(member.id, +e.target.value)}
              />
            </div>
          ))}
      </div>

      {errorMessage && <span className="py-1 text-destructive text-xs">{errorMessage}</span>}

      <div className="flex flex-row gap-2">
        <Button>{data?.id ? "Update" : "Create"}</Button>
        {data?.id && handleDeleteAction && (
          <Button
            type="button"
            variant={"destructive"}
            onClick={() =>
              handleDeleteAction({ expenseId: data.id, groupId: groupId })
            }
          >
            Delete
          </Button>
        )}
        <Button asChild type="button" variant={"outline"}>
          <Link href={".."}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
