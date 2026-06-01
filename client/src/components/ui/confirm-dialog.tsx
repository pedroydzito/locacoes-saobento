import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar exclusão",
  description = "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.",
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  variant = "destructive",
}: ConfirmDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const content = (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-2xl shrink-0 ${variant === "destructive" ? "bg-destructive/10" : "bg-primary/10"}`}>
          <AlertTriangle className={`w-6 h-6 ${variant === "destructive" ? "text-destructive" : "text-primary"}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onClose}
          className="h-11 rounded-xl flex-1 border-border hover:bg-muted/50 transition-colors"
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`h-11 rounded-xl font-bold flex-1 transition-all active:scale-[0.98] ${
            variant === "destructive"
              ? "bg-destructive text-white hover:bg-destructive/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[420px] border border-border rounded-2xl p-6 shadow-none">
          <DialogHeader className="text-left mb-2">
            <DialogTitle className="text-lg font-bold font-display">{title}</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 max-h-[92vh] overflow-y-auto bg-card border-t border-border shadow-none">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
        <SheetHeader className="text-left mb-4">
          <SheetTitle className="text-lg font-bold font-display">{title}</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
