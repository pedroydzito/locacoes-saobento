import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockMachines, mockServices } from "@/lib/mock-data";
import { Search, Plus, Filter, MoreHorizontal, FileDown, Edit, Trash2, Tractor, Calendar, Clock, BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionModal } from "@/components/ui/action-modal";
import { MachineForm } from "@/components/forms/MachineForm";
import { Badge } from "@/components/ui/badge";
import { MobileListControls } from "@/components/shared/MobileListControls";
import { MobileCard, MobileCardContent, MobileCardActions } from "@/components/shared/MobileCard";

export default function Machines() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState("all");

  const parseTime = (timeStr: string) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
  };

  const machinesWithStats = mockMachines.map(machine => {
    const machineServices = mockServices.filter(s => s.machine === machine.name);
    
    const calculatedHours = machineServices.reduce((acc, curr) => {
      if (curr.hora_inicial && curr.hora_final) {
        const start = parseTime(curr.hora_inicial);
        const end = parseTime(curr.hora_final);
        let diff = end - start;
        if (diff < 0) diff += 24;
        return acc + diff;
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

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta máquina?")) {
      // Logic to delete would go here
    }
  };

  const handleSave = () => {
    setIsModalOpen(false);
  };

  const userRole = localStorage.getItem("userRole") || "operador";

  return (
    <div className="space-y-6 pb-8">
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
            Nova Máquina
          </Button>
        </div>
      </div>

      <MobileListControls 
        onExportClick={() => {}} 
        onFilterClick={() => setIsFilterModalOpen(true)}
        filterLabel="Filtrar por Tipo"
      />

      <Card className="border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-card">
          <div className="relative w-full sm:max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome ou chapa..." 
              className="pl-9 border-border bg-muted/20 rounded-xl h-10 shadow-none focus-visible:ring-primary/20"
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
                <tr key={machine.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => handleEdit(machine)}>
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
                  <td className="p-4 text-right font-bold text-success-text">
                    {formatCurrency(machine.profit_generated)}
                  </td>
                  <td className="p-4 text-center">
                    <Badge className="bg-success-subtle text-success-text border-success/20">Ativo</Badge>
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
            <MobileCard key={machine.id} onClick={() => handleEdit(machine)}>
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
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Horas</p>
                  <p className="font-bold text-sm text-foreground">{machine.hours_worked}h</p>
                </div>
              </MobileCardActions>
            </MobileCard>
          ))}
        </div>
      </Card>

      <button
        onClick={handleAdd}
        className="sm:hidden fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95"
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
        title="Filtrar por Tipo"
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Tipo de Máquina</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-11 rounded-xl w-full border-border bg-card text-sm shadow-none">
                <SelectValue placeholder="Selecione o Tipo" />
              </SelectTrigger>
              <SelectContent className="rounded-xl z-50 max-h-[200px] overflow-y-auto">
                <SelectItem value="all" className="cursor-pointer">Todos os Tipos</SelectItem>
                {machineTypes.map((type) => (
                  <SelectItem key={type} value={type} className="cursor-pointer">{type}</SelectItem>
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