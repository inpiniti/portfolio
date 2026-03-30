"use client";

import { useStateBinding } from "@json-render/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  title: string;
  description?: string | null;
  openPath: string;
}

export function ScrollableDialog({
  props,
  children,
}: {
  props: Props;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useStateBinding<boolean>(props.openPath ?? "");

  return (
    <Dialog open={open ?? false} onOpenChange={(v) => setOpen(v)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          {props.description && (
            <DialogDescription>{props.description}</DialogDescription>
          )}
        </DialogHeader>
        <div style={{ overflowY: "auto", maxHeight: "65vh", marginRight: "-16px", paddingRight: "16px" }}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
