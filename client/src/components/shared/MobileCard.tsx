import { ReactNode } from "react";

interface MobileCardProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export function MobileCard({ children, onClick, className = "" }: MobileCardProps) {
  return (
    <div
      className={`bg-card rounded-2xl border border-border p-4 touch-card ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        {children}
      </div>
    </div>
  );
}

export function MobileCardContent({ title, subtitle, metadata }: { title: string | ReactNode, subtitle?: string | ReactNode, metadata?: string | ReactNode }) {
  return (
    <div className="flex-1 min-w-0">
      {metadata && <p className="text-xs text-muted-foreground font-medium mb-0.5">{metadata}</p>}
      <div className="font-bold text-foreground text-base leading-tight truncate font-display tracking-tight">{title}</div>
      {subtitle && <div className="text-sm text-muted-foreground mt-0.5 font-sans">{subtitle}</div>}
    </div>
  );
}

export function MobileCardActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-end gap-2">
      {children}
    </div>
  );
}
