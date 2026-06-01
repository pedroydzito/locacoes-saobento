import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockMachines, mockServices } from "@/lib/mock-data";
import { Search, Plus, Filter, MoreHorizontal, FileDown, Edit, Trash2, Tractor, Calendar, Clock, BarChart3, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionModal } from "@/components/ui/action-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MachineForm } from "@/components/forms/MachineForm";
import { Badge } from "@/components/ui/badge";
import { MobileListControls } from "@/components/shared/MobileListControls";
import { MobileCard, MobileCardContent, MobileCardActions } from "@/components/shared/MobileCard";

export default function Machines() {
  const [, setLocation] = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [typeFilter, setTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const parseTime = (timeStr: string) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
  };

  const machinesWithStats = mockMachines.map(machine => {
    const machineServices = mockServices.filter(s => {
      const matchesMachine = s.machine === machine.name;
      const matchesStart = !startDate || s.date >= startDate;
      const matchesEnd = !endDate || s.date <= endDate;
      return matchesMachine && matchesStart && matchesEnd;
    });
    
    const calculatedHours = machineServices.reduce((acc, curr) => {
      if (curr.hora_inicial != null && curr.hora_final != null) {
        const start = typeof curr.hora_inicial === 'number' ? curr.hora_inicial : parseFloat(curr.hora_inicial);
        const end = typeof curr.hora_final === 'number' ? curr.hora_final : parseFloat(curr.hora_final);
        if (!isNaN(start) && !isNaN(end)) {
          return acc + (end - start);
        }
      }
      return acc + (curr.hours || 0);
    }, 0);

    const calculatedProfit = machineServices.reduce((acc, curr) => acc + (curr.profit || 0), 0);

    return {
      ...machine,
      hours_worked: Number(calculatedHours.toFixed(1)),
      profit_generated: calculatedProfit
    };
  });

  const machineTypes = Array.from(new Set(mockMachines.map(m => m.type)));

  const filteredMachines = machinesWithStats.filter(machine => 
    typeFilter === "all" || machine.type === typeFilter
  );

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

  const handleUpdateMachine = (updatedMachine: any) => {
    const idx = mockMachines.findIndex(m => m.id === updatedMachine.id);
    if (idx !== -1) mockMachines[idx] = updatedMachine;
    setRefreshKey(k => k + 1);
  };

  const handleViewDetails = (item: any) => {
    setLocation(`/maquinas/${item.id}`);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingId) {
      const idx = mockMachines.findIndex(m => m.id === deletingId);
      if (idx !== -1) mockMachines.splice(idx, 1);
      setDeletingId(null);
      setIsDeleteDialogOpen(false);
      setRefreshKey(k => k + 1);
    }
  };

  const handleSave = (data: any) => {
    if (editingItem) {
      const idx = mockMachines.findIndex(m => m.id === editingItem.id);
      if (idx !== -1) mockMachines[idx] = { ...editingItem, ...data };
    } else {
      mockMachines.unshift({ id: `maq-${Date.now()}`, ...data, hours_worked: 0, profit_generated: 0, chapa: "NEW" });
    }
    setIsModalOpen(false);
    setRefreshKey(k => k + 1);
  };

  const userRole = localStorage.getItem("userRole") || "operador";

  return (
    <div className="space-y-6 pb-8" key={refreshKey}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Tractor className="w-7 h-7 text-primary hidden sm:block" />
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
              Frota e Máquinas <span className="text-muted-foreground font-normal ml-1">({filteredMachines.length})</span>
            </h1>
          </div>
          <p className="hidden sm:block text-sm text-muted-foreground mt-1">Controle de equipamentos, custos e rentabilidade.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" className="hidden sm:flex border-border bg-white rounded-xl h-10  transition-all">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button 
            variant="outline" 
            className={`hidden sm:flex border-border bg-white rounded-xl h-10 transition-all ${typeFilter !== "all" || startDate || endDate ? "border-primary text-primary" : ""}`} 
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Filter className={`w-4 h-4 mr-2 ${typeFilter !== "all" || startDate || endDate ? "fill-primary/10" : ""}`} />
            Filtros
            {(typeFilter !== "all" || startDate || endDate) && (
              <Badge className="ml-2 bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                {Number(typeFilter !== "all") + Number(!!startDate) + Number(!!endDate)}
              </Badge>
            )}
          </Button>
          <Button onClick={handleAdd} className="rounded-xl h-10 px-5 transition-all active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none shadow-none">
            <Plus className="w-4 h-4 mr-2" />
            Nova Máquina
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(typeFilter !== "all" || startDate || endDate) && (
        <div className="flex flex-wrap items-center gap-2 mb-4 animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-1">Filtros Ativos:</span>
          {typeFilter !== "all" && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 rounded-lg px-2 py-1 flex items-center gap-1 group transition-all hover:bg-primary/20">
              Tipo: {typeFilter}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setTypeFilter("all")} />
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
            onClick={() => {
              setTypeFilter("all");
              setStartDate("");
              setEndDate("");
            }}
          >
            Limpar Todos
          </Button>
        </div>
      )}

      <MobileListControls 
        onExportClick={() => {}} 
        onFilterClick={() => setIsFilterModalOpen(true)}
        filterLabel="Filtrar por Tipo"
      />

      <Card className="border-border rounded-2xl  overflow-hidden">
        <div className="p-4 border-b border-border bg-card">
          <div className="relative w-full sm:max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome ou chapa..." 
              className="pl-9 border-border bg-muted/20 rounded-xl h-10 e focus-visible:ring-primary/20"
            />
          </div>
        </div>
        
        {/* Tabela Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide font-bold">
                <th className="p-4">Máquina</th>
                <th className="p-4">Tipo</th>
                <th className="p-4 text-center">Horas Acumuladas</th>
                <th className="p-4 text-right">Rentabilidade Total</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 w-[52px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {filteredMachines.map((machine) => (
                <tr key={machine.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => handleViewDetails(machine)}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        <Tractor className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground leading-none">{machine.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{machine.chapa || 'SEM CHAPA'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary" className="bg-neutral-subtle text-neutral-text border-none text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {machine.type}
                    </Badge>
                  </td>
                  <td className="p-4 text-center font-bold text-foreground">
                    {machine.hours_worked}h
                  </td>
                  <td className={`p-4 text-right font-bold ${machine.profit_generated >= 0 ? 'text-success-text' : 'text-destructive'}`}>
                    {formatCurrency(machine.profit_generated)}
                  </td>
                  <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="focus:outline-none">
                        <Badge variant="outline" className={`cursor-pointer hover:opacity-80 transition-opacity e font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 border-none ${
                          machine.status === 'em_manutencao' ? 'bg-destructive/10 text-destructive' :
                          machine.status === 'disponivel' ? 'bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))]' :
                          'bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))]'
                        }`}>
                          {machine.status === 'em_manutencao' ? 'Em Manutenção' : machine.status === 'disponivel' ? 'Disponível' : 'Operando'}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="w-[160px] rounded-xl">
                        <DropdownMenuItem onClick={() => handleUpdateMachine({ ...machine, status: 'operando' })} className="rounded-lg cursor-pointer flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[hsl(var(--warning))]" /> Operando
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateMachine({ ...machine, status: 'disponivel' })} className="rounded-lg cursor-pointer flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" /> Disponível
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateMachine({ ...machine, status: 'em_manutencao' })} className="rounded-lg cursor-pointer flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-destructive" /> Em Manutenção
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="group-hover:opacity-100 transition-opacity rounded-full text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(machine)} className="rounded-lg cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        {userRole === 'admin' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(machine.id)} className="text-destructive focus:bg-destructive/10 rounded-lg cursor-pointer">
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
          {filteredMachines.map((machine) => (
            <MobileCard key={machine.id} onClick={() => handleViewDetails(machine)}>
              <MobileCardContent 
                title={machine.name}
                subtitle={
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-neutral-subtle text-neutral-text border-none text-[10px] px-1.5 py-0 rounded-full font-bold uppercase tracking-wider">{machine.type}</Badge>
                    <span className="text-[10px] text-muted-foreground">{machine.chapa || 'SEM CHAPA'}</span>
                  </div>
                }
              />
              <MobileCardActions>
                <div className="flex flex-col items-end w-full">
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="text-left">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Horas</p>
                      <p className="font-bold text-sm text-foreground">{machine.hours_worked}h</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Rentabilidade</p>
                      <p className={`font-bold text-sm ${machine.profit_generated >= 0 ? 'text-success-text' : 'text-destructive'}`}>
                        {formatCurrency(machine.profit_generated)}
                      </p>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="focus:outline-none">
                        <Badge variant="outline" className={`cursor-pointer hover:opacity-80 transition-opacity e font-bold text-[10px] uppercase tracking-wider px-2 py-0 border-none ${
                          machine.status === 'em_manutencao' ? 'bg-destructive/10 text-destructive' :
                          machine.status === 'disponivel' ? 'bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))]' :
                          'bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))]'
                        }`}>
                          {machine.status === 'em_manutencao' ? 'Em Manutenção' : machine.status === 'disponivel' ? 'Disponível' : 'Operando'}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[160px] rounded-xl">
                        <DropdownMenuItem onClick={() => handleUpdateMachine({ ...machine, status: 'operando' })} className="rounded-lg cursor-pointer flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[hsl(var(--warning))]" /> Operando
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateMachine({ ...machine, status: 'disponivel' })} className="rounded-lg cursor-pointer flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" /> Disponível
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateMachine({ ...machine, status: 'em_manutencao' })} className="rounded-lg cursor-pointer flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-destructive" /> Em Manutenção
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </MobileCardActions>
            </MobileCard>
          ))}
        </div>
      </Card>

      <button
        onClick={handleAdd}
        className="sm:hidden fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-primary text-white rounded-full  flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>

      <ActionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? "Editar Máquina" : "Nova Máquina"}
      >
        <MachineForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingItem} />
      </ActionModal>

      <ActionModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtrar por Período"
      >
        <div className="space-y-5 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Tipo de Equipamento</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-11 rounded-xl w-full border-border bg-muted/10 text-sm hover:bg-muted/20 transition-colors">
                <SelectValue placeholder="Todos os Tipos" />
              </SelectTrigger>
              <SelectContent className="rounded-xl z-50 border-border">
                <SelectItem value="all" className="cursor-pointer">Todos os Tipos</SelectItem>
                {machineTypes.map((type) => (
                  <SelectItem key={type} value={type} className="cursor-pointer">{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Início</label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="h-11 rounded-xl border-border bg-muted/10 font-mono text-sm focus-visible:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Fim</label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="h-11 rounded-xl border-border bg-muted/10 font-mono text-sm focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6 pt-4 border-t border-border/50">
            <Button 
              variant="outline" 
              className="flex-1 h-11 rounded-xl border-border hover:bg-muted/50" 
              onClick={() => {
                setTypeFilter("all");
                setStartDate("");
                setEndDate("");
              }}
            >
              Limpar Tudo
            </Button>
            <Button className="flex-1 h-11 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIsFilterModalOpen(false)}>
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </ActionModal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir máquina"
        description="Tem certeza que deseja excluir esta máquina? Esta ação não pode ser desfeita."
      />
    </div>
  );
}