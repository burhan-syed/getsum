"use client";

import { Share } from "lucide-react";
import { Button } from "./ui/Button";
import { useToast } from "./ui/Toast/useToast";

export default function ShareButton({ groupId, groupName }: { groupId: string, groupName: string }) {
  const { toast } = useToast();

  return (
    <Button
      onClick={async() => {
        const shareLink = `${window.location.protocol}//${window.location.host}/groups/${groupId}`;
        const shareData = {
          title: `Join group ${groupName}`,
          text: ``,
          url: `/groups/${groupId}`,
        };
        try {
          await navigator.share(shareData);
        } catch (err) {
          navigator.clipboard.writeText(shareLink);
          toast({
            title: "Share link copied",
          });
        }
        
      }}
    >
      <Share size={16} />
    </Button>
  );
}
