import { Button } from "@/components/ui/button";
import { Filter, Download } from "lucide-react";

interface MobileListControlsProps {
  onFilterClick?: () => void;
  onExportClick?: () => void;
  exportLabel?: string;
  filterLabel?: string;
}

export function MobileListControls({
  onFilterClick,
  onExportClick,
  exportLabel = "Exportar",
  filterLabel = "Filtros"
}: MobileListControlsProps) {
  return (
    <div className="sm:hidden flex gap-2 w-full mb-4">
      {onExportClick && (
        <Button variant="outline" className="flex-1 h-12 border-border shadow-none" onClick={onExportClick}>
          <Download className="w-4 h-4 mr-2" />
          {exportLabel}
        </Button>
      )}
      {onFilterClick && (
        <Button variant="outline" className="flex-1 h-12 border-border shadow-none" onClick={onFilterClick}>
          <Filter className="w-4 h-4 mr-2" />
          {filterLabel}
        </Button>
      )}
    </div>
  );
}
