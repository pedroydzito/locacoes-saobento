import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockServices, mockClients, mockMachines } from "@/lib/mock-data";
import { Search, Plus, Filter, MoreHorizontal, FileDown, Edit, Trash2, DollarSign, Pickaxe, Calendar, Clock, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionModal } from "@/components/ui/action-modal";
import { ServiceForm } from "@/components/forms/ServiceForm";
import { CostManager } from "@/components/forms/CostManager";
import { MobileListControls } from "@/components/shared/MobileListControls";
import { MobileCard, MobileCardContent, MobileCardActions } from "@/components/shared/MobileCard";

export default function Services() {
  const [services, setServices] = useState<any[]>(mockServices);
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [selectedMachine, setSelectedMachine] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [managingCostService, setManagingCostService] = useState<any>(null);

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

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleManageCosts = (service: any) => {
    setManagingCostService(service);
    setIsCostModalOpen(true);
  };

  const handleUpdateService = (updatedService: any) => {
    updatedService.profit = calculateServiceProfit(updatedService);

    setServices((prev) =>
      prev.map(s => s.id === updatedService.id ? updatedService : s)
    );
    setManagingCostService(updatedService);

    const idx = mockServices.findIndex(s => s.id === updatedService.id);
    if (idx !== -1) mockServices[idx] = updatedService;
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      // Logic to delete would go here
    }
  };

  const handleSave = () => {
    setIsModalOpen(false);
  };

  const userRole = localStorage.getItem("userRole") || "operador";

  const sortedClients = [...mockClients].sort((a, b) => a.name.localeCompare(b.name));
  const sortedMachines = [...mockMachines].sort((a, b) => a.name.localeCompare(b.name));

  const filteredServices = services.filter((service) => {
    const matchClient = selectedClient === "all" || service.client === selectedClient;
    const matchMachine = selectedMachine === "all" || service.machine === selectedMachine;
    return matchClient && matchMachine;
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
          <Button variant="outline" className="hidden sm:flex border-border bg-white rounded-xl h-10 shadow-sm transition-all">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" className="hidden sm:flex border-border bg-white rounded-xl h-10 shadow-sm transition-all" onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={handleAdd} className="rounded-xl h-10 px-5 shadow-sm transition-all active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-2" />
            Novo Serviço
          </Button>
        </div>
      </div>

      <MobileListControls
        onExportClick={() => { }}
        onFilterClick={() => setIsFilterModalOpen(true)}
        filterLabel="Filtrar por Máquina"
      />

      <Card className="border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-card flex items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente ou local..."
              className="pl-9 border-border bg-muted/20 rounded-xl h-10 focus-visible:ring-primary/20 shadow-none"
            />
          </div>
        </div>

        {/* Tabela Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide font-bold">
                <th className="p-4">OS</th>
                <th className="p-4">Data</th>
                <th className="p-4">Cliente / Obra</th>
                <th className="p-4">Máquina</th>
                <th className="p-4">Operador</th>
                <th className="p-4 text-right">Hora Inicial</th>
                <th className="p-4 text-right">Hora Final</th>
                <th className="p-4 text-right">Diesel</th>
                <th className="p-4 text-right">Valor Total</th>
                <th className="p-4 text-right">Lucro</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 w-[52px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="p-4 font-bold text-primary">{service.id}</td>
                  <td className="p-4 text-muted-foreground">{new Date(service.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 font-bold text-foreground">{service.client}</td>
                  <td className="p-4 text-muted-foreground">{service.machine}</td>
                  <td className="p-4 text-muted-foreground">{service.operator}</td>
                  <td className="p-4 text-right font-bold">{service.hora_inicial || '-'}</td>
                  <td className="p-4 text-right font-bold">{service.hora_final || '-'}</td>
                  <td className="p-4 text-right text-muted-foreground">{service.diesel}L</td>
                  <td className="p-4 text-right font-bold text-foreground">{formatCurrency(service.value)}</td>
                  <td className={`p-4 text-right font-bold ${service.profit >= 0 ? 'text-[hsl(var(--success-text))]' : 'text-destructive'}`}>
                    {formatCurrency(service.profit)}
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant={service.status === 'concluido' ? 'default' : 'secondary'} className={service.status === 'concluido' ? 'bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.3)] shadow-none' : 'bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.3)] shadow-none'}>
                      {service.status === 'concluido' ? 'Concluído' : 'Em andamento'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
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
                        <DropdownMenuItem onClick={() => handleManageCosts(service)} className="rounded-lg cursor-pointer">
                          <DollarSign className="w-4 h-4 mr-2" /> Custos
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards Mobile */}
        <div className="sm:hidden divide-y divide-border/60 bg-card">
          {filteredServices.map((service) => (
            <MobileCard key={service.id} onClick={() => handleEdit(service)}>
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
                    <p className="font-medium text-foreground/80">{service.machine}</p>
                    <p className="text-muted-foreground">{service.operator}</p>
                  </div>
                }
              />
              <MobileCardActions>
                <Badge variant="outline" className={`shadow-none font-bold text-[10px] uppercase tracking-wider ${service.status === 'concluido'
                    ? 'bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)]'
                    : 'bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.2)]'
                  }`}>
                  {service.status === 'concluido' ? 'Concluído' : 'Em andamento'}
                </Badge>
                <div className="text-right mt-1">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">{service.hora_inicial} - {service.hora_final}</p>
                  <p className="font-bold text-sm text-primary">{formatCurrency(service.value)}</p>
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
        className="sm:hidden fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
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
      <ActionModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtrar por Máquina"
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Máquina</label>
            <Select value={selectedMachine} onValueChange={setSelectedMachine}>
              <SelectTrigger className="h-11 rounded-xl w-full border-border bg-card text-sm shadow-none">
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
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Cliente</label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="h-11 rounded-xl w-full border-border bg-card text-sm shadow-none">
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
          <Button className="w-full h-12 mt-4 rounded-xl font-bold" onClick={() => setIsFilterModalOpen(false)}>
            Aplicar Filtros
          </Button>
        </div>
      </ActionModal>
    </div>
  );
}