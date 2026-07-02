import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockServices, mockClients, mockMachines } from "@/lib/mock-data";
import { Search, Plus, Filter, MoreHorizontal, FileDown, FileText, Edit, Trash2, DollarSign, Pickaxe, X, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionModal } from "@/components/ui/action-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ServiceForm } from "@/components/forms/ServiceForm";
import { CostManager } from "@/components/forms/CostManager";
import { exportServiceToPDF, ServicePDFSections } from "@/lib/pdf-export";
import { MobileListControls } from "@/components/shared/MobileListControls";
import { MobileCard, MobileCardContent, MobileCardActions } from "@/components/shared/MobileCard";
import { BillingReportModal } from "@/components/forms/BillingReportModal";
import { PDFExportModal } from "@/components/shared/PDFExportModal";

export default function Services() {
  const [, setLocation] = useLocation();
  const [services, setServices] = useState<any[]>(mockServices);
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [selectedMachine, setSelectedMachine] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [managingCostService, setManagingCostService] = useState<any>(null);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [pdfTargetService, setPdfTargetService] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const SERVICE_PDF_SECTIONS = [
    { key: "clientInfo",       label: "Informações do Cliente",    description: "Nome, CPF/CNPJ, telefone e endereço do cliente.", defaultChecked: true },
    { key: "operationDetails", label: "Detalhes da Operação",      description: "Datas, horímetros, máquina, operador e tipo de serviço.", defaultChecked: true },
    { key: "dieselInfo",       label: "Relação de Óleo Diesel",    description: "Quantidade consumida e fornecedor do combustível.", defaultChecked: false },
    { key: "financial",        label: "Detalhamento Financeiro",   description: "Receita, custos, lucro líquido e margem.", defaultChecked: true },
    { key: "photos",           label: "Anexos e Evidências",       description: "Fotos e documentos anexados ao serviço.", defaultChecked: true },
  ];

  const calculateServiceProfit = (service: any) => {
    const totalCosts = (service.additionalCosts || []).reduce((acc: number, curr: any) => acc + curr.value, 0);
    return service.value - totalCosts;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (service: any) => {
    setEditingItem(service);
    setIsModalOpen(true);
  };

  const handleManageCosts = (service: any) => {
    setManagingCostService(service);
    setIsCostModalOpen(true);
  };

  const handleViewDetails = (service: any) => {
    setLocation(`/servicos/${service.id}`);
  };

  const handleUpdateService = (updatedService: any) => {
    updatedService.profit = calculateServiceProfit(updatedService);

    setServices((prev) =>
      prev.map(s => s.id === updatedService.id ? updatedService : s)
    );

    const idx = mockServices.findIndex(s => s.id === updatedService.id);
    if (idx !== -1) mockServices[idx] = updatedService;
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingId) {
      setServices(prev => prev.filter(s => s.id !== deletingId));
      const idx = mockServices.findIndex(s => s.id === deletingId);
      if (idx !== -1) mockServices.splice(idx, 1);
      setDeletingId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleSave = () => {
    setIsModalOpen(false);
    setServices([...mockServices]);
  };

  const handleClearFilters = () => {
    setSelectedClient("all");
    setSelectedMachine("all");
    setStartDate("");
    setEndDate("");
  };

  const handleOpenPDF = (service: any) => {
    setPdfTargetService(service);
    setIsPDFModalOpen(true);
  };

  const handleExportPDF = async (selectedSections: Record<string, boolean>) => {
    if (!pdfTargetService) return;
    setIsGeneratingPDF(true);
    await exportServiceToPDF(pdfTargetService, mockClients, selectedSections as unknown as ServicePDFSections);
    setIsGeneratingPDF(false);
    setIsPDFModalOpen(false);
    setPdfTargetService(null);
  };

  const userRole = localStorage.getItem("userRole") || "operador";

  const sortedClients = [...mockClients].sort((a, b) => a.name.localeCompare(b.name));
  const sortedMachines = [...mockMachines].sort((a, b) => a.name.localeCompare(b.name));

  const filteredServices = services.filter((service) => {
    const matchClient = selectedClient === "all" || service.client === selectedClient;
    const matchMachine = selectedMachine === "all" || service.machine === selectedMachine;
    const matchDateStart = !startDate || service.date >= startDate;
    const matchDateEnd = !endDate || service.date <= endDate;
    return matchClient && matchMachine && matchDateStart && matchDateEnd;
  });

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Pickaxe className="w-7 h-7 text-primary hidden sm:block" />
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
              Obras & Serviços <span className="text-muted-foreground font-normal ml-1">({filteredServices.length})</span>
            </h1>
          </div>
          <p className="hidden sm:block text-sm text-muted-foreground mt-1">Gerencie apontamentos, horas e faturamento.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            className="hidden sm:flex border-border bg-white rounded-xl h-10 transition-all text-primary hover:text-primary hover:bg-primary/5"
            onClick={() => setIsBillingModalOpen(true)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Gerar Cobrança (PDF)
          </Button>
          <Button variant="outline" className="hidden sm:flex border-border bg-white rounded-xl h-10  transition-all">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button 
            variant="outline" 
            className={`hidden sm:flex border-border bg-white rounded-xl h-10 transition-all ${selectedMachine !== "all" || selectedClient !== "all" || startDate || endDate ? "border-primary text-primary" : ""}`} 
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Filter className={`w-4 h-4 mr-2 ${selectedMachine !== "all" || selectedClient !== "all" || startDate || endDate ? "fill-primary/10" : ""}`} />
            Filtros
            {(selectedMachine !== "all" || selectedClient !== "all" || startDate || endDate) && (
              <Badge className="ml-2 bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                {[selectedMachine !== "all", selectedClient !== "all", !!startDate || !!endDate].filter(Boolean).length}
              </Badge>
            )}
          </Button>
          <Button onClick={handleAdd} className="rounded-xl h-10 px-5 transition-all active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none shadow-none">
            <Plus className="w-4 h-4 mr-2" />
            Novo Serviço
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedMachine !== "all" || selectedClient !== "all" || startDate || endDate) && (
        <div className="flex flex-wrap items-center gap-2 mb-4 animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-1">Filtros Ativos:</span>
          {selectedClient !== "all" && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 rounded-lg px-2 py-1 flex items-center gap-1 group transition-all hover:bg-primary/20">
              Cliente: {selectedClient}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedClient("all")} />
            </Badge>
          )}
          {selectedMachine !== "all" && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 rounded-lg px-2 py-1 flex items-center gap-1 group transition-all hover:bg-primary/20">
              Máquina: {selectedMachine}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedMachine("all")} />
            </Badge>
          )}
          {(startDate || endDate) && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 rounded-lg px-2 py-1 flex items-center gap-1 group transition-all hover:bg-primary/20">
              Período: {startDate || "..."} - {endDate || "..."}
              <X className="w-3 h-3 cursor-pointer" onClick={() => { setStartDate(""); setEndDate(""); }} />
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-[10px] uppercase font-bold text-muted-foreground hover:text-destructive transition-colors"
            onClick={handleClearFilters}
          >
            Limpar Todos
          </Button>
        </div>
      )}

      <MobileListControls
        onExportClick={() => setIsBillingModalOpen(true)}
        onFilterClick={() => setIsFilterModalOpen(true)}
        filterLabel="Filtrar por Máquina"
      />

      <Card className="border-border rounded-2xl  overflow-hidden">
        <div className="p-4 border-b border-border bg-card flex items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente ou local..."
              className="pl-9 border-border bg-muted/20 rounded-xl h-10 focus-visible:ring-primary/20 e"
            />
          </div>
        </div>

        {/* Tabela Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground text-[10px] uppercase tracking-widest font-bold">
                <th className="p-4">OS</th>
                <th className="p-4">Data</th>
                <th className="p-4">Cliente / Obra</th>
                <th className="p-4">Tipo Serviço</th>
                <th className="p-4">Máquina</th>
                <th className="p-4">Operador</th>
                <th className="p-4 text-right">H. Ini</th>
                <th className="p-4 text-right">H. Fim</th>
                <th className="p-4 text-right">H. Total</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 w-[52px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-card">
              {filteredServices.map((service) => {
                const hTotal = typeof service.hora_final === 'number' && typeof service.hora_inicial === 'number'
                  ? (service.hora_final - service.hora_inicial).toFixed(1)
                  : '-';
                return (
                <tr 
                  key={service.id} 
                  className="hover:bg-muted/30 transition-colors group cursor-pointer"
                  onClick={() => handleViewDetails(service)}
                >
                  <td className="p-4 font-bold text-primary hover:underline underline-offset-4 decoration-primary/30">
                    {service.id}
                  </td>
                  <td className="p-4 text-muted-foreground">{new Date(service.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 font-bold text-foreground">{service.client}</td>
                  <td className="p-4 text-muted-foreground text-xs">{service.serviceType || '-'}</td>
                  <td className="p-4 text-muted-foreground">{service.machine}</td>
                  <td className="p-4 text-muted-foreground">{service.operator}</td>
                  <td className="p-4 text-right font-mono text-sm">{service.hora_inicial ?? '-'}</td>
                  <td className="p-4 text-right font-mono text-sm">{service.hora_final ?? '-'}</td>
                  <td className="p-4 text-right font-bold text-primary">{hTotal}h</td>
                  <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="focus:outline-none">
                        <Badge variant={service.status === 'concluido' ? 'default' : 'secondary'} className={`cursor-pointer hover:opacity-80 transition-opacity ${service.status === 'concluido' ? 'bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.3)] e' : 'bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.3)] e'}`}>
                          {service.status === 'concluido' ? 'Concluído' : 'Em andamento'}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="w-[160px] rounded-xl">
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
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(service)} className="rounded-lg cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewDetails(service)} className="rounded-lg cursor-pointer">
                          <FileText className="w-4 h-4 mr-2" /> Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenPDF(service); }} className="rounded-lg cursor-pointer">
                          <Download className="w-4 h-4 mr-2" /> Exportar PDF
                        </DropdownMenuItem>
                        {userRole === 'admin' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(service.id)} className="text-destructive focus:bg-destructive/10 rounded-lg cursor-pointer">
                              <Trash2 className="w-4 h-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>

        {/* Cards Mobile */}
        <div className="sm:hidden divide-y divide-border/60 bg-card">
          {filteredServices.map((service) => (
            <MobileCard key={service.id} onClick={() => handleViewDetails(service)}>
              <MobileCardContent
                metadata={
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">{service.id}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(service.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                }
                title={service.client}
                subtitle={
                  <div className="space-y-0.5 text-xs">
                    <p className="text-primary font-medium">{service.serviceType || 'Serviço'}</p>
                    <p className="font-medium text-foreground/80">{service.machine}</p>
                    <p className="text-muted-foreground">{service.operator}</p>
                  </div>
                }
              />
              <MobileCardActions>
                <div className="flex flex-col gap-1 items-start" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                      <Badge variant="outline" className={`cursor-pointer hover:opacity-80 transition-opacity e font-bold text-[10px] uppercase tracking-wider ${service.status === 'concluido'
                          ? 'bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)]'
                          : 'bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.2)]'
                        }`}>
                        {service.status === 'concluido' ? 'Concluído' : 'Em andamento'}
                      </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[160px] rounded-xl">
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
                </div>
                <div className="text-right mt-1">
                  <p className="text-[10px] text-muted-foreground font-mono font-medium">{service.hora_inicial} → {service.hora_final}</p>
                  <p className="font-bold text-sm text-primary">{typeof service.hora_final === 'number' && typeof service.hora_inicial === 'number' ? `${(service.hora_final - service.hora_inicial).toFixed(1)}h` : '-'}</p>
                </div>
              </MobileCardActions>
            </MobileCard>
          ))}
        </div>

        <div className="p-4 border-t border-border bg-card flex items-center justify-between text-sm text-muted-foreground">
          <span>Mostrando {filteredServices.length} serviços</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-lg h-8" disabled>Anterior</Button>
            <Button variant="outline" size="sm" className="rounded-lg h-8">Próximo</Button>
          </div>
        </div>
      </Card>

      {/* FAB Mobile */}
      <button
        onClick={handleAdd}
        className="sm:hidden fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-primary rounded-full  flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Editar Serviço" : "Novo Serviço"}
      >
        <ServiceForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingItem} />
      </ActionModal>

      <ActionModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        title="Gerar Cobrança (PDF)"
      >
        <BillingReportModal onClose={() => setIsBillingModalOpen(false)} />
      </ActionModal>

      <ActionModal
        isOpen={isCostModalOpen}
        onClose={() => setIsCostModalOpen(false)}
        title={`Custos - OS ${managingCostService?.id}`}
      >
        {managingCostService && (
          <CostManager
            service={managingCostService}
            onUpdateService={handleUpdateService}
          />
        )}
      </ActionModal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir serviço"
        description="Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos."
      />

      <ActionModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtros de Pesquisa"
      >
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Máquina</label>
            <Select value={selectedMachine} onValueChange={setSelectedMachine}>
              <SelectTrigger className="h-11 rounded-xl w-full border-border bg-muted/10 text-sm">
                <SelectValue placeholder="Selecione a Máquina" />
              </SelectTrigger>
              <SelectContent className="rounded-xl z-[100] max-h-[200px] overflow-y-auto">
                <SelectItem value="all" className="cursor-pointer">Todas as Máquinas</SelectItem>
                {sortedMachines.map((m) => (
                  <SelectItem key={m.id} value={m.name} className="cursor-pointer">{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Cliente / Talhão</label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="h-11 rounded-xl w-full border-border bg-muted/10 text-sm">
                <SelectValue placeholder="Selecione o Cliente" />
              </SelectTrigger>
              <SelectContent className="rounded-xl z-[100] max-h-[200px] overflow-y-auto">
                <SelectItem value="all" className="cursor-pointer">Todos os Clientes</SelectItem>
                {sortedClients.map((c) => (
                  <SelectItem key={c.id} value={c.name} className="cursor-pointer">{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Data Inicial</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-11 rounded-xl bg-muted/10" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Data Final</label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-11 rounded-xl bg-muted/10" />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border/50">
            <Button variant="ghost" className="h-12 sm:h-10 rounded-xl flex-1" onClick={handleClearFilters}>Limpar Filtros</Button>
            <Button className="h-12 sm:h-10 rounded-xl font-bold flex-1" onClick={() => setIsFilterModalOpen(false)}>
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </ActionModal>

      {/* PDF Section Selector Modal */}
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
    </div>
  );
}