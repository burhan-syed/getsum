"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { Loader } from "lucide-react";

export default function SettleButton({
  groupId,
  userId,
  handleSubmit,
}: {
  groupId: string;
  userId: number;
  handleSubmit: (d: { groupId: string; userId: number }) => Promise<any>;
}) {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    try {
      await handleSubmit({ groupId, userId });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      disabled={loading}
      onClick={handleClick}
      variant={loading ? "ghost" : "default"}
      className="px-2 h-4 text-xs gap-2"
    >
      Settle Debts
      {loading && <div className="animate-spin"><Loader size={10}/></div>}
    </Button>
  );
}
