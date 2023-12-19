"use client";
import { useState } from "react";

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
    <form action={handleExpenseFormAction}>
      <input type="hidden" name="groupId" value={groupId} required/>
      <div>
        <label htmlFor="members-select">members</label>
        <select
          id="members-select"
          name="members[]"
          multiple
          onChange={(e) => {
            setSelectedMembers(
              Array.from(e.target.selectedOptions, (o) => +o.value)
            );
          }}
        >
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.fullName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="paid-by">paid by</label>
        <select id="paid-by" name="paidBy">
          {members
            .filter(({ id }) => selectedMembers.includes(id))
            .map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName}
              </option>
            ))}
        </select>
      </div>
      <div>
        <label htmlFor="expense-title">Title</label>
        <input type="text" id="expense-title" name="title" required />
      </div>
      <div>
        <label htmlFor="expense-total">Total</label>
        <input
          type="number"
          id="expense-total"
          name="total"
          required
          value={total}
          onChange={(e) => setTotal(+(e.target.value || ""))}
        />
      </div>
      <div>
        <h4>Splits</h4>
        {members
          .filter(({ id }) => selectedMembers.includes(id))
          .map((member) => (
            <div key={`splits-${member.id}`}>
              <label htmlFor={`split-${member.id}`}>{member.fullName}</label>
              <input
                id={`split-${member.id}`}
                name={`splits[]-${member.id}`}
                type="number"
                min={0}
                required
              />
            </div>
          ))}
      </div>

      <button>Submit</button>
    </form>
  );
}
