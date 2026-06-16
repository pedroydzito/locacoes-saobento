import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { mockServices } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionModal } from "@/components/ui/action-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ServiceForm } from "@/components/forms/ServiceForm";
import { CostManager } from "@/components/forms/CostManager";
import { Edit, DollarSign, Calendar, Clock, Pickaxe, Fuel, TrendingUp, MapPin, ChevronRight, ArrowLeft, Trash2, Gauge, Download, Image as ImageIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportServiceToPDF, ServicePDFSections } from "@/lib/pdf-export";
import { mockClients } from "@/lib/mock-data";
import { PDFExportModal } from "@/components/shared/PDFExportModal";

const SERVICE_PDF_SECTIONS = [
  { key: "clientInfo",       label: "Informações do Cliente",    description: "Nome, CPF/CNPJ, telefone e endereço do cliente.", defaultChecked: true },
  { key: "operationDetails", label: "Detalhes da Operação",      description: "Datas, horímetros, máquina, operador e tipo de serviço.", defaultChecked: true },
  { key: "dieselInfo",       label: "Relação de Óleo Diesel",    description: "Quantidade consumida e fornecedor do combustível.", defaultChecked: false },
  { key: "financial",        label: "Detalhamento Financeiro",   description: "Receita, custos, lucro líquido e margem.", defaultChecked: true },
  { key: "photos",           label: "Anexos e Evidências",       description: "Fotos e documentos anexados ao serviço.", defaultChecked: true },
];

export default function ServiceDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/servicos/:id");
  const serviceId = params?.id;

  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const service = mockServices.find(s => s.id === serviceId) as any;

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground text-lg">Serviço não encontrado.</p>
        <Button variant="outline" onClick={() => setLocation("/servicos")} className="rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Serviços
        </Button>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const costs = service.costs || { machine: 0, operator: 0, diesel: 0 };
  const totalCosts = (costs.machine || 0) + (costs.operator || 0) + (costs.diesel || 0);
  const profit = (service.value || 0) - totalCosts;
  const margin = service.value > 0 ? (profit / service.value) * 100 : 0;

  const hTotal = typeof service.hora_final === 'number' && typeof service.hora_inicial === 'number'
    ? (service.hora_final - service.hora_inicial).toFixed(1)
    : '-';

  const handleUpdateService = (updatedService: any) => {
    const idx = mockServices.findIndex(s => s.id === updatedService.id);
    if (idx !== -1) mockServices[idx] = updatedService;
    setRefreshKey(k => k + 1);
  };

  const handleDelete = () => {
    const idx = mockServices.findIndex(s => s.id === serviceId);
    if (idx !== -1) mockServices.splice(idx, 1);
    setLocation("/servicos");
  };

  const handleEditSave = () => {
    setIsEditModalOpen(false);
    setRefreshKey(k => k + 1);
  };

  const handleExportPDF = (selectedSections: Record<string, boolean>) => {
    setIsGeneratingPDF(true);
    setTimeout(() => {
      exportServiceToPDF(service, mockClients, selectedSections as unknown as ServicePDFSections);
      setIsGeneratingPDF(false);
      setIsPDFModalOpen(false);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-8" key={refreshKey}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <button
          onClick={() => setLocation("/servicos")}
          className="hover:text-primary transition-colors font-medium cursor-pointer"
        >
          Obras & Serviços
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-bold">{service.id}</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/servicos")}
              className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground sm:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
                Detalhes da OS — {service.id}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {service.client} • {new Date(service.date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Badge variant="secondary" className={`cursor-pointer hover:opacity-80 transition-opacity text-[10px] uppercase font-bold tracking-widest px-3 py-1 ${
                service.status === 'concluido'
                  ? 'bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.3)]'
                  : 'bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.3)]'
              }`}>
                {service.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px] rounded-xl">
              <DropdownMenuItem 
                onClick={() => handleUpdateService({ ...service, status: 'em_andamento' })} 
                className="rounded-lg cursor-pointer flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--warning))]" /> Em Andamento
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleUpdateService({ ...service, status: 'concluido' })} 
                className="rounded-lg cursor-pointer flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" /> Concluído
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPDFModalOpen(true)}
            className="rounded-xl h-9 border border-border transition-all hover:bg-primary/5 hover:text-primary shadow-none"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="rounded-xl h-9 border border-border transition-all hover:bg-primary/5 hover:text-primary shadow-none"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar OS
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="rounded-xl h-9 border border-border text-destructive hover:bg-destructive/5 hover:text-destructive shadow-none"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-muted/20 border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-3 h-3" /> Data
          </p>
          <p className="font-bold text-sm">{new Date(service.date).toLocaleDateString('pt-BR')}</p>
        </div>
        <div className="p-4 rounded-2xl bg-muted/20 border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <Pickaxe className="w-3 h-3" /> Tipo de Serviço
          </p>
          <p className="font-bold text-sm uppercase">{service.serviceType || '-'}</p>
        </div>
        <div className="p-4 rounded-2xl bg-muted/20 border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <Gauge className="w-3 h-3" /> Horímetro
          </p>
          <p className="font-bold text-sm font-mono">{service.hora_inicial} → {service.hora_final}</p>
          <p className="text-xs text-primary font-bold mt-0.5">{hTotal}h trabalhadas</p>
        </div>
        <div className="p-4 rounded-2xl bg-muted/20 border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <Fuel className="w-3 h-3" /> Diesel
          </p>
          <p className="font-bold text-sm">{service.diesel} L</p>
          {service.diesel > 0 && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {service.dieselSupplier === 'sao_bento' ? 'São Bento' : 'Cliente'}
            </p>
          )}
        </div>
      </div>

      {/* Equipment & Profit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-4">
            <Pickaxe className="w-3.5 h-3.5" /> Equipamento e Equipe
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tipo de Serviço:</span>
              <span className="font-bold text-sm text-primary">{service.serviceType || '-'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Máquina:</span>
              <span className="font-bold text-sm">{service.machine}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Operador:</span>
              <span className="font-bold text-sm">{service.operator}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cliente/Obra:</span>
              <span className="font-bold text-sm text-primary">{service.client}</span>
            </div>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border border-border ${profit >= 0 ? 'bg-success/5' : 'bg-destructive/5'}`}>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-4">
            <TrendingUp className={`w-3.5 h-3.5 ${profit >= 0 ? 'text-success' : 'text-destructive'}`} /> Lucro
          </p>
          <div className="space-y-1">
            <p className={`text-3xl font-bold font-display ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(profit)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={`text-[10px] border border-border shadow-none ${profit >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                {margin.toFixed(1)}% de margem
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Detalhamento Financeiro</h4>
        <Card className="rounded-2xl border border-border bg-card overflow-hidden shadow-none">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <div className="p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-muted/5 border-b border-border">
                <div>
                  <span className="text-sm font-bold">Faturamento (Receita)</span>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Total faturado nesta OS</p>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <span className="font-bold text-primary text-xl">{formatCurrency(service.value || 0)}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCostModalOpen(true)}
                    className="rounded-xl h-8 text-[10px] uppercase font-bold border border-border bg-white transition-all hover:bg-primary/5 hover:text-primary shadow-none"
                  >
                    <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                    Gerenciar Custos
                  </Button>
                </div>
              </div>
              
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Custo de Máquina (Horas)</span>
                  <span className="font-medium text-destructive">{formatCurrency(costs.machine || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Custo de Operador</span>
                  <span className="font-medium text-destructive">{formatCurrency(costs.operator || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Custo de Combustível</span>
                  <span className="font-medium text-destructive">{formatCurrency(costs.diesel || 0)}</span>
                </div>

                {/* Additional costs */}
                {(service.additionalCosts || []).filter((c: any) => !['Custo Máquina', 'Custo Operador', 'Custo Diesel (São Bento)'].includes(c.name)).map((cost: any) => (
                  <div key={cost.id} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{cost.name}</span>
                    <span className="font-medium text-destructive">{formatCurrency(cost.value)}</span>
                  </div>
                ))}
              </div>

              <div className="p-5 flex justify-between items-center bg-muted/30 border-t border-border">
                <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Total de Custos</span>
                <span className="font-bold text-destructive text-lg">{formatCurrency(totalCosts)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Photos Section */}
      {service.photos && service.photos.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Anexos e Evidências</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {service.photos.map((photo: any, idx: number) => {
              const photoName = typeof photo === 'string' ? photo : photo.url;
              return (
              <div key={idx} className="aspect-square rounded-2xl border border-border bg-muted/20 flex flex-col items-center justify-center p-4 relative group overflow-hidden">
                <ImageIcon className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <span className="text-[10px] font-medium text-muted-foreground text-center line-clamp-2">{photoName}</span>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <ActionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Serviço"
      >
        <ServiceForm
          onSave={handleEditSave}
          onCancel={() => setIsEditModalOpen(false)}
          initialData={service}
        />
      </ActionModal>

      {/* Cost Modal */}
      <ActionModal
        isOpen={isCostModalOpen}
        onClose={() => setIsCostModalOpen(false)}
        title={`Custos - OS ${service.id}`}
      >
        <CostManager
          service={service}
          onUpdateService={handleUpdateService}
        />
      </ActionModal>

      {/* PDF Export Modal */}
      <ActionModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        title="Exportar Relatório PDF"
      >
        <PDFExportModal
          sections={SERVICE_PDF_SECTIONS}
          onExport={handleExportPDF}
          onClose={() => setIsPDFModalOpen(false)}
          isGenerating={isGeneratingPDF}
        />
      </ActionModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Excluir serviço"
        description="Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos."
      />
    </div>
  );
}
