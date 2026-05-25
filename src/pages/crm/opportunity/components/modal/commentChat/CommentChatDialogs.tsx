import { BaseDialog } from "@/layouts/presentation/baseDialog";
import { useMarkOppCommentsRead } from "@/sharedKernel";
import { useEffect } from "react";
import { OpportunityCommentsChat } from "./CommentChat";

type Props = {
  open: boolean;
  linkToken: string;
  onClose: () => void;
};

export function OpportunityCommentsDialog({ open, onClose, linkToken }: Props) {
  const markReadMut = useMarkOppCommentsRead();
  useEffect(() => {
    if (open && linkToken) {
      markReadMut.mutate({ linkToken });
    }
  }, [open, linkToken]);
  return (
    <BaseDialog open={open} onClose={onClose} width="max-w-lg">
      <div className="h-[75vh] flex flex-col bg-slate-50">
        <OpportunityCommentsChat linkToken={linkToken} />
      </div>
    </BaseDialog>
  );
}
