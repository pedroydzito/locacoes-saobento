import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockOperators, mockServices, mockMachines } from "@/lib/mock-data";
import { Search, Plus, Filter, MoreHorizontal, FileDown, Edit, Trash2, Users, Calendar, Clock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionModal } from "@/components/ui/action-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { OperatorForm } from "@/components/forms/OperatorForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileListControls } from "@/components/shared/MobileListControls";
import { MobileCard, MobileCardContent, MobileCardActions } from "@/components/shared/MobileCard";

export default function Operators() {
  const [, setLocation] = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [machineFilter, setMachineFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const sortedMachines = [...mockMachines].map(m => m.name).sort();

  const parseTime = (timeStr: string) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
  };

  const filteredOperators = mockOperators.filter(op => {
    const matchesSearch = op.name.toLowerCase().includes(searchQuery.toLowerCase());
    const machines = Array.isArray(op.machine_assigned) ? op.machine_assigned : [op.machine_assigned];
    const matchesMachine = machineFilter === "all" || machines.includes(machineFilter);
    return matchesSearch && matchesMachine;
  }).map(op => {
    const opServices = mockServices.filter(s => {
      const matchesOperator = s.operator === op.name;
      const matchesStart = !startDate || s.date >= startDate;
      const matchesEnd = !endDate || s.date <= endDate;
      return matchesOperator && matchesStart && matchesEnd;
    });

    const calculatedHours = opServices.reduce((acc, curr) => {
      if (curr.hora_inicial != null && curr.hora_final != null) {
        const start = typeof curr.hora_inicial === 'number' ? curr.hora_inicial : parseFloat(curr.hora_inicial);
        const end = typeof curr.hora_final === 'number' ? curr.hora_final : parseFloat(curr.hora_final);
        if (!isNaN(start) && !isNaN(end)) {
          return acc + (end - start);
        }
      }
      return acc + (curr.hours || 0);
    }, 0);

    const calculatedCommission = (calculatedHours * (op.commission_per_hour || 0)) + (opServices.length * (op.fixed_commission || 0));

    return { 
      ...op, 
      services_done: opServices.length, 
      hours_worked: Number(calculatedHours.toFixed(1)),
      calculatedCommission
    };
  }).filter(op => {
    if (startDate || endDate) {
      return op.services_done > 0;
    }
    return true;
  });

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

  const handleViewDetails = (item: any) => {
    setLocation(`/operadores/${item.id}`);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingId) {
      const idx = mockOperators.findIndex(op => op.id === deletingId);
      if (idx !== -1) mockOperators.splice(idx, 1);
      setDeletingId(null);
      setIsDeleteDialogOpen(false);
      setRefreshKey(k => k + 1);
    }
  };

  const handleSave = (data: any) => {
    if (editingItem) {
      const idx = mockOperators.findIndex(op => op.id === editingItem.id);
      if (idx !== -1) mockOperators[idx] = { ...editingItem, ...data };
    } else {
      mockOperators.unshift({ id: `op-${Date.now()}`, ...data, hours_worked: 0, services_done: 0 });
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
            <Users className="w-7 h-7 text-primary hidden sm:block" />
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
              Operadores <span className="text-muted-foreground font-normal ml-1">({filteredOperators.length})</span>
            </h1>
          </div>
          <p className="hidden sm:block text-sm text-muted-foreground mt-1">Gestão da equipe de operadores e horímetros.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" className="hidden sm:flex border-border bg-white rounded-xl h-10  transition-all">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button 
            variant="outline" 
            className={`hidden sm:flex border-border bg-white rounded-xl h-10 transition-all ${machineFilter !== "all" || startDate || endDate ? "border-primary text-primary" : ""}`} 
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Filter className={`w-4 h-4 mr-2 ${machineFilter !== "all" || startDate || endDate ? "fill-primary/10" : ""}`} />
            Filtros
            {(machineFilter !== "all" || startDate || endDate) && (
              <Badge className="ml-2 bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                {Number(machineFilter !== "all") + Number(!!startDate) + Number(!!endDate)}
              </Badge>
            )}
          </Button>
          <Button onClick={handleAdd} className="rounded-xl h-10 px-5 transition-all active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none shadow-none">
            <Plus className="w-4 h-4 mr-2" />
            Novo Operador
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(machineFilter !== "all" || startDate || endDate) && (
        <div className="flex flex-wrap items-center gap-2 mb-4 animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-1">Filtros Ativos:</span>
          {machineFilter !== "all" && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 rounded-lg px-2 py-1 flex items-center gap-1 group transition-all hover:bg-primary/20">
              Máquina: {machineFilter}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setMachineFilter("all")} />
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
              setMachineFilter("all");
              setStartDate("");
              setEndDate("");
            }}
          >
            Limpar Todos
          </Button>
        </div>
      )}

      <MobileListControls
        onExportClick={() => { }}
        onFilterClick={() => setIsFilterModalOpen(true)}
        filterLabel="Filtrar por Máquina"
      />

      <Card className="border-border rounded-2xl  overflow-hidden">
        <div className="p-4 border-b border-border bg-card">
          <div className="relative w-full sm:max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar operador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-border bg-muted/20 rounded-xl h-10 e focus-visible:ring-primary/20"
            />
          </div>
        </div>

        {/* Tabela Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide font-bold">
                <th className="p-4">Nome</th>
                <th className="p-4">Máquinas Designadas</th>
                <th className="p-4 text-center">Horas Trabalhadas</th>
                <th className="p-4 text-center">Serviços Feitos</th>
                <th className="p-4 text-right">Salário Total (Est.)</th>
                <th className="p-4 w-[52px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {filteredOperators.map((operator) => (
                <tr key={operator.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => handleViewDetails(operator)}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {operator.name.charAt(0)}
                      </div>
                      <span className="font-bold text-foreground">{operator.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {operator.machine_assigned.slice(0, 2).map((m: any) => (
                        <Badge key={m} variant="secondary" className="bg-neutral-subtle text-neutral-text border-none text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {m}
                        </Badge>
                      ))}
                      {operator.machine_assigned.length > 2 && (
                        <Badge variant="outline" className="text-[10px] px-2 py-0">
                          +{operator.machine_assigned.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center text-muted-foreground">{operator.hours_worked}h</td>
                  <td className="p-4 text-center">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      {operator.services_done}
                    </Badge>
                  </td>
                  <td className="p-4 text-right font-bold text-foreground">
                    <div className="flex flex-col items-end">
                      <span>{formatCurrency((startDate || endDate ? 0 : operator.salary) + operator.calculatedCommission)}</span>
                      {((operator.commission_per_hour || 0) > 0 || (operator.fixed_commission || 0) > 0) && (
                        <span className="text-[10px] text-muted-foreground mt-0.5 block">
                          {(startDate || endDate) ? `Apenas Comissões (Período)` : `Base: ${formatCurrency(operator.salary)}`}
                        </span>
                      )}
                    </div>
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
                        <DropdownMenuItem onClick={() => handleEdit(operator)} className="rounded-lg cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        {userRole === 'admin' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(operator.id)} className="text-destructive focus:bg-destructive/10 rounded-lg cursor-pointer">
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
          {filteredOperators.map((operator) => (
            <MobileCard key={operator.id} onClick={() => handleViewDetails(operator)}>
              <MobileCardContent
                title={operator.name}
                subtitle={
                  <div className="flex flex-wrap gap-1 mt-1">
                    {operator.machine_assigned.map((m: any) => (
                      <span key={m} className="text-[10px] bg-neutral-subtle text-neutral-text px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{m}</span>
                    ))}
                  </div>
                }
              />
              <MobileCardActions>
                <div className="flex gap-4 items-center">
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Serviços</p>
                    <p className="font-bold text-sm text-primary">{operator.services_done}</p>
                  </div>
                  <div className="text-right border-l border-border pl-4">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                      {(startDate || endDate) ? 'Comissão' : 'Total (Est.)'}
                    </p>
                    <span className="font-bold text-foreground text-sm flex items-center gap-2">
                    {formatCurrency((startDate || endDate ? 0 : operator.salary) + operator.calculatedCommission)}
                  </span>
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
        title={editingItem ? "Editar Operador" : "Novo Operador"}
      >
        <OperatorForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingItem} />
      </ActionModal>

      <ActionModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtrar por Período"
      >
        <div className="space-y-5 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Máquina Principal</label>
            <Select value={machineFilter} onValueChange={setMachineFilter}>
              <SelectTrigger className="h-11 rounded-xl w-full border-border bg-muted/10 text-sm hover:bg-muted/20 transition-colors">
                <SelectValue placeholder="Todas as Máquinas" />
              </SelectTrigger>
              <SelectContent className="rounded-xl z-50 border-border">
                <SelectItem value="all" className="cursor-pointer">Todas as Máquinas</SelectItem>
                {sortedMachines.map((m) => (
                  <SelectItem key={m} value={m} className="cursor-pointer">{m}</SelectItem>
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
                setMachineFilter("all");
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
        title="Excluir operador"
        description="Tem certeza que deseja excluir este operador? Esta ação não pode ser desfeita."
      />
    </div>
  );
}