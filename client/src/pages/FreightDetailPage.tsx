import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { mockFreights, getFreightKmTotal, getFreightTotalValue } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionModal } from "@/components/ui/action-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FreightForm } from "@/components/forms/FreightForm";
import { Edit, Trash2, ChevronRight, ArrowLeft, Truck, MapPin, User, DollarSign, Calendar, ArrowRight, FileDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportFreightToPDF, FreightPDFSections } from "@/lib/pdf-export";
import { PDFExportModal } from "@/components/shared/PDFExportModal";

const statusMap: Record<string, { label: string; cls: string }> = {
  concluido:    { label: "Concluído",    cls: "text-[hsl(var(--success-text))] bg-[hsl(var(--success-subtle))] border-[hsl(var(--success)/0.3)]" },
  em_andamento: { label: "Em Andamento", cls: "text-[hsl(var(--warning-text))] bg-[hsl(var(--warning-subtle))] border-[hsl(var(--warning)/0.3)]" },
  planejado:    { label: "Planejado",    cls: "text-muted-foreground bg-muted border-border" },
};

const FREIGHT_PDF_SECTIONS = [
  { key: "routeInfo",   label: "Informações da Rota",  description: "ID, data, origem, destino e status do frete.", defaultChecked: true },
  { key: "vehicleInfo", label: "Veículo e Condutor",   description: "Máquina transportada e motorista responsável.", defaultChecked: true },
  { key: "kmInfo",      label: "Quilometragem",         description: "KM inicial, final e total percorrido.", defaultChecked: true },
  { key: "financial",   label: "Informação Financeira", description: "Valor por km e total do frete.", defaultChecked: true },
  { key: "notes",       label: "Observações",          description: "Anotações e observações do frete.", defaultChecked: true },
];

export default function FreightDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/fretes/:id");
  const freightId = params?.id;
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const freight = mockFreights.find(f => f.id === freightId) as any;

  if (!freight) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground text-lg">Frete não encontrado.</p>
        <Button variant="outline" onClick={() => setLocation("/fretes")} className="rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Fretes
        </Button>
      </div>
    );
  }

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const status = statusMap[freight.status] || statusMap.planejado;
  const kmTotal = getFreightKmTotal(freight);
  const totalValue = getFreightTotalValue(freight);
  const rate = Number(freight.price_per_km) || 0;

  const handleExportPDF = async (selectedSections: Record<string, boolean>) => {
    setIsGeneratingPDF(true);
    try {
      await exportFreightToPDF({ ...freight, value: totalValue }, selectedSections as unknown as FreightPDFSections);
    } finally {
      setIsGeneratingPDF(false);
      setIsPDFModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 pb-8" key={refreshKey}>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <button onClick={() => setLocation("/fretes")} className="hover:text-primary transition-colors font-medium cursor-pointer">
          Fretes
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-bold">{freight.id}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/fretes")}
            className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground sm:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight">Frete — {freight.id}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{freight.machine} · {new Date(freight.date).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Badge variant="outline" className={`cursor-pointer hover:opacity-80 transition-opacity e text-[10px] font-bold uppercase tracking-widest px-3 py-1 ${status.cls}`}>
                {status.label}
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px] rounded-xl">
              <DropdownMenuItem onClick={() => {
                const idx = mockFreights.findIndex(f => f.id === freight.id);
                if (idx !== -1) mockFreights[idx].status = 'planejado';
                setRefreshKey(k => k + 1);
              }} className="rounded-lg cursor-pointer flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--warning))]" /> Planejado
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const idx = mockFreights.findIndex(f => f.id === freight.id);
                if (idx !== -1) mockFreights[idx].status = 'em_andamento';
                setRefreshKey(k => k + 1);
              }} className="rounded-lg cursor-pointer flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--info))]" /> Em Andamento
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const idx = mockFreights.findIndex(f => f.id === freight.id);
                if (idx !== -1) mockFreights[idx].status = 'concluido';
                setRefreshKey(k => k + 1);
              }} className="rounded-lg cursor-pointer flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" /> Concluído
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={() => setIsPDFModalOpen(true)}
            className="rounded-xl h-9 border-border hover:bg-primary/5 hover:text-primary shadow-none">
            <FileDown className="w-4 h-4 mr-2" /> Exportar PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}
            className="rounded-xl h-9 border-border hover:bg-primary/5 hover:text-primary shadow-none">
            <Edit className="w-4 h-4 mr-2" /> Editar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(true)}
            className="rounded-xl h-9 border-border text-destructive hover:bg-destructive/5 hover:text-destructive shadow-none">
            <Trash2 className="w-4 h-4 mr-2" /> Excluir
          </Button>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
        <div className="text-center sm:text-right">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1 justify-center sm:justify-end">
            <MapPin className="w-3 h-3" /> Origem
          </p>
          <p className="font-bold text-lg">{freight.origin || "—"}</p>
        </div>
        <ArrowRight className="w-8 h-8 text-primary shrink-0" />
        <div className="text-center sm:text-left">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1 justify-center sm:justify-start">
            <MapPin className="w-3 h-3" /> Destino
          </p>
          <p className="font-bold text-lg">{freight.destination || "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Calendar, label: "Data", value: new Date(freight.date).toLocaleDateString('pt-BR') },
          { icon: Truck, label: "Carga", value: freight.machine },
          { icon: User, label: "Motorista", value: freight.driver || "—" },
          { icon: User, label: "Cliente", value: freight.client || "—" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="p-4 rounded-2xl bg-muted/20 border border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
              <Icon className="w-3 h-3" /> {label}
            </p>
            <p className="font-bold text-sm">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">KM Inicial</p>
          <p className="font-bold text-lg">{freight.km_inicial?.toLocaleString('pt-BR') || "—"}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">KM Final</p>
          <p className="font-bold text-lg">{freight.km_final?.toLocaleString('pt-BR') || "—"}</p>
        </div>
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Total Percorrido</p>
          <p className="font-bold text-lg text-primary">
            {kmTotal > 0 ? `${kmTotal.toLocaleString('pt-BR')} km` : "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Valor por KM</p>
          <p className="font-bold text-lg">{rate > 0 ? formatCurrency(rate) : "—"}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border sm:col-span-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3 h-3" /> Valor Total
          </p>
          <p className="font-bold text-lg text-primary">
            {kmTotal > 0 && rate > 0
              ? `${kmTotal.toLocaleString("pt-BR")} km × ${formatCurrency(rate)} = ${formatCurrency(totalValue)}`
              : formatCurrency(totalValue)}
          </p>
        </div>
      </div>

      {freight.notes && (
        <div className="p-5 rounded-2xl bg-card border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Observações</p>
          <p className="text-sm text-muted-foreground">{freight.notes}</p>
        </div>
      )}

      <ActionModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Frete">
        <FreightForm
          onSave={(data) => {
            const idx = mockFreights.findIndex(f => f.id === freight.id);
            if (idx !== -1) mockFreights[idx] = { ...mockFreights[idx], ...data };
            setIsEditModalOpen(false);
            setRefreshKey(k => k + 1);
          }}
          onCancel={() => setIsEditModalOpen(false)}
          initialData={freight}
        />
      </ActionModal>
      <ConfirmDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          const idx = mockFreights.findIndex(f => f.id === freightId);
          if (idx !== -1) mockFreights.splice(idx, 1);
          setLocation("/fretes");
        }} title="Excluir frete"
        description={`Tem certeza que deseja excluir o frete "${freight.id}"?`} />

      <ActionModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        title={`Exportar Frete — ${freight.id}`}
      >
        <PDFExportModal
          sections={FREIGHT_PDF_SECTIONS}
          onExport={handleExportPDF}
          onClose={() => setIsPDFModalOpen(false)}
          isGenerating={isGeneratingPDF}
        />
      </ActionModal>
    </div>
  );
}
