import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, Loader2, FileText } from "lucide-react";

export interface PDFSection {
  key: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}

interface PDFExportModalProps {
  title?: string;
  sections: PDFSection[];
  onExport: (selectedSections: Record<string, boolean>) => void;
  onClose: () => void;
  isGenerating?: boolean;
}

export function PDFExportModal({ title = "Exportar PDF", sections, onExport, onClose, isGenerating }: PDFExportModalProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map(s => [s.key, s.defaultChecked !== false]))
  );

  const toggleSection = (key: string) => {
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const allSelected = selectedCount === sections.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(Object.fromEntries(sections.map(s => [s.key, false])));
    } else {
      setSelected(Object.fromEntries(sections.map(s => [s.key, true])));
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Header info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Selecione as seções</h3>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              {selectedCount} de {sections.length} seções selecionadas
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-[10px] uppercase font-bold text-primary hover:bg-primary/10"
          onClick={toggleAll}
        >
          {allSelected ? "Desmarcar Todos" : "Selecionar Todos"}
        </Button>
      </div>

      {/* Sections list */}
      <div className="space-y-2">
        {sections.map(section => (
          <div
            key={section.key}
            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
              selected[section.key]
                ? "bg-primary/5 border-primary/20"
                : "bg-card border-border/50 opacity-70"
            }`}
            onClick={() => toggleSection(section.key)}
          >
            <Checkbox
              id={`pdf-section-${section.key}`}
              checked={selected[section.key] ?? false}
              onCheckedChange={() => toggleSection(section.key)}
              className="mt-0.5 rounded border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <div className="flex-1 min-w-0">
              <Label
                htmlFor={`pdf-section-${section.key}`}
                className="font-bold text-sm cursor-pointer"
              >
                {section.label}
              </Label>
              {section.description && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{section.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border/50">
        <Button
          variant="outline"
          onClick={onClose}
          className="h-12 sm:h-11 rounded-xl flex-1 sm:flex-none border-border"
        >
          Cancelar
        </Button>
        <Button
          disabled={selectedCount === 0 || isGenerating}
          onClick={() => onExport(selected)}
          className="h-12 sm:h-11 rounded-xl font-bold flex-1 sm:flex-none gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-none"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Gerando PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Exportar PDF
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
