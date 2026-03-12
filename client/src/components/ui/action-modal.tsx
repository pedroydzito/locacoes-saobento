import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function ActionModal({ isOpen, onClose, title, children }: ModalProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)");

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[400px] border-border rounded-2xl p-6">
          <DialogHeader className="text-left mb-4">
            <DialogTitle className="text-xl font-bold font-display">{title}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {children}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 max-h-[92vh] overflow-y-auto bg-card border-t border-border">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
        <SheetHeader className="text-left mb-4">
          <SheetTitle className="text-lg font-bold font-display">{title}</SheetTitle>
        </SheetHeader>
        <div className="py-2">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}