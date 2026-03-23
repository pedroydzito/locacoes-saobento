import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockOperators, mockServices, mockMachines } from "@/lib/mock-data";
import { Search, Plus, MoreHorizontal, Edit, Trash2, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionModal } from "@/components/ui/action-modal";
import { OperatorForm } from "@/components/forms/OperatorForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Operators() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Operadores</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão da equipe de operadores e horímetros.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-border rounded-xl h-10 shadow-sm transition-all hidden sm:flex">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleAdd} className="rounded-xl h-10 px-5 shadow-sm transition-all hidden sm:flex active:scale-95">
            <Plus className="w-4 h-4 mr-2" />
            Novo Operador
          </Button>
        </div>
      </div>

      <Card className="border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-card flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full sm:flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar operador..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-border bg-card rounded-xl h-10"
            />
          </div>
          <div className="w-full sm:w-auto min-w-[200px]">
            <Select value={machineFilter} onValueChange={setMachineFilter}>
              <SelectTrigger className="h-10 rounded-xl bg-card border-border">
                <SelectValue placeholder="Todas as Máquinas" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Todas as Máquinas</SelectItem>
                {sortedMachines.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Tabela Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide font-bold">
                <th className="p-4">Nome</th>
                <th className="p-4">Máquina Associada</th>
                <th className="p-4 text-right">Salário Base</th>
                <th className="p-4 text-right">Horas no Mês</th>
                <th className="p-4 text-center">Serviços Feitos</th>
                <th className="p-4 w-[52px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {filteredOperators.map((op) => {
                const machines = Array.isArray(op.machine_assigned) ? op.machine_assigned : [op.machine_assigned];
                const visibleMachines = machines.slice(0, 2);
                const hiddenCount = machines.length - 2;

                return (
                <tr key={op.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="p-4 font-bold text-foreground">{op.name}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {visibleMachines.map(m => (
                        <Badge key={m} variant="outline" className="bg-[hsl(var(--info-subtle))] text-[hsl(var(--info-text))] border-[hsl(var(--info)/0.3)] shadow-none text-xs rounded-full">
                          {m}
                        </Badge>
                      ))}
                      {hiddenCount > 0 && (
                        <Badge variant="outline" className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] shadow-none text-xs rounded-full">
                          +{hiddenCount}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right text-muted-foreground font-mono">{formatCurrency(op.salary)}</td>
                  <td className="p-4 text-right font-bold font-mono">{op.hours_worked}h</td>
                  <td className="p-4 text-center font-mono">{op.services_done}</td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(op)} className="rounded-lg cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(op.id)} className="text-destructive focus:bg-destructive/10 rounded-lg cursor-pointer">
                          <Trash2 className="w-4 h-4 mr-2" /> Excluir
                        </DropdownMenuItem>
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
          {filteredOperators.map((op) => {
            const machines = Array.isArray(op.machine_assigned) ? op.machine_assigned : [op.machine_assigned];
            const visibleMachines = machines.slice(0, 2);
            const hiddenCount = machines.length - 2;

            return (
            <div key={op.id} className="p-4 touch-card" onClick={() => handleEdit(op)}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-base leading-tight truncate mb-1">{op.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {visibleMachines.map(m => (
                      <Badge key={m} variant="outline" className="bg-[hsl(var(--info-subtle))] text-[hsl(var(--info-text))] border-[hsl(var(--info)/0.3)] shadow-none text-[10px] rounded-full">
                        {m}
                      </Badge>
                    ))}
                    {hiddenCount > 0 && (
                      <Badge variant="outline" className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] shadow-none text-[10px] rounded-full">
                        +{hiddenCount}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground font-medium mb-0.5">Horas Mês</p>
                  <p className="font-bold font-mono text-base">{op.hours_worked}h</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground">Salário</p>
                  <p className="text-sm font-medium font-mono">{formatCurrency(op.salary)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Serviços Feitos</p>
                  <p className="text-sm font-medium font-mono">{op.services_done}</p>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </Card>

      {/* FAB Mobile */}
      <button
        onClick={handleAdd}
        className="sm:hidden fixed bottom-[5.5rem] right-4 z-40 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
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
    </div>
  );
}