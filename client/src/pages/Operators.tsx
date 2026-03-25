import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockOperators, mockServices, mockMachines } from "@/lib/mock-data";
import { Search, Plus, Filter, MoreHorizontal, FileDown, Edit, Trash2, Users, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionModal } from "@/components/ui/action-modal";
import { OperatorForm } from "@/components/forms/OperatorForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileListControls } from "@/components/shared/MobileListControls";
import { MobileCard, MobileCardContent, MobileCardActions } from "@/components/shared/MobileCard";

export default function Operators() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [machineFilter, setMachineFilter] = useState("all");

  const sortedMachines = [...mockMachines].map(m => m.name).sort();

  const filteredOperators = mockOperators.filter(op => {
    const matchesSearch = op.name.toLowerCase().includes(searchQuery.toLowerCase());
    const machines = Array.isArray(op.machine_assigned) ? op.machine_assigned : [op.machine_assigned];
    const matchesMachine = machineFilter === "all" || machines.includes(machineFilter);
    return matchesSearch && matchesMachine;
  }).map(op => {
    const servicesCount = mockServices.filter(s => s.operator === op.name).length;
    return { ...op, services_done: servicesCount };
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

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este operador?")) {
      // Logic
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
            <Users className="w-7 h-7 text-primary hidden sm:block" />
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
              Operadores <span className="text-muted-foreground font-normal ml-1">({filteredOperators.length})</span>
            </h1>
          </div>
          <p className="hidden sm:block text-sm text-muted-foreground mt-1">Gestão da equipe de operadores e horímetros.</p>
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
            Novo Operador
          </Button>
        </div>
      </div>

      <MobileListControls
        onExportClick={() => { }}
        onFilterClick={() => setIsFilterModalOpen(true)}
        filterLabel="Filtrar por Máquina"
      />

      <Card className="border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-card">
          <div className="relative w-full sm:max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar operador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-border bg-muted/20 rounded-xl h-10 shadow-none focus-visible:ring-primary/20"
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
                <th className="p-4 text-right">Salário</th>
                <th className="p-4 w-[52px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {filteredOperators.map((op) => (
                <tr key={op.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => handleEdit(op)}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {op.name.charAt(0)}
                      </div>
                      <span className="font-bold text-foreground">{op.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {op.machine_assigned.slice(0, 2).map((m: any) => (
                        <Badge key={m} variant="secondary" className="bg-neutral-subtle text-neutral-text border-none text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {m}
                        </Badge>
                      ))}
                      {op.machine_assigned.length > 2 && (
                        <Badge variant="outline" className="text-[10px] px-2 py-0">
                          +{op.machine_assigned.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center text-muted-foreground">{op.hours_worked}h</td>
                  <td className="p-4 text-center">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      {op.services_done}
                    </Badge>
                  </td>
                  <td className="p-4 text-right font-bold text-foreground">{formatCurrency(op.salary)}</td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="group-hover:opacity-100 transition-opacity rounded-full text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(op)} className="rounded-lg cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        {userRole === 'admin' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(op.id)} className="text-destructive focus:bg-destructive/10 rounded-lg cursor-pointer">
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
          {filteredOperators.map((op) => (
            <MobileCard key={op.id} onClick={() => handleEdit(op)}>
              <MobileCardContent
                title={op.name}
                subtitle={
                  <div className="flex flex-wrap gap-1 mt-1">
                    {op.machine_assigned.map((m: any) => (
                      <span key={m} className="text-[10px] bg-neutral-subtle text-neutral-text px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{m}</span>
                    ))}
                  </div>
                }
              />
              <MobileCardActions>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Serviços</p>
                  <p className="font-bold text-sm text-primary">{op.services_done}</p>
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
        title={editingItem ? "Editar Operador" : "Novo Operador"}
      >
        <OperatorForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingItem} />
      </ActionModal>

      <ActionModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtrar por Máquina"
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Máquina Principal</label>
            <Select value={machineFilter} onValueChange={setMachineFilter}>
              <SelectTrigger className="h-11 rounded-xl w-full border-border bg-card text-sm shadow-none">
                <SelectValue placeholder="Selecione a Máquina" />
              </SelectTrigger>
              <SelectContent className="rounded-xl z-50 max-h-[200px] overflow-y-auto">
                <SelectItem value="all" className="cursor-pointer">Todas as Máquinas</SelectItem>
                {sortedMachines.map((m) => (
                  <SelectItem key={m} value={m} className="cursor-pointer">{m}</SelectItem>
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