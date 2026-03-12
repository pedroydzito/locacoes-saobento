import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockMachines } from "@/lib/mock-data";
import { Search, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionModal } from "@/components/ui/action-modal";
import { MachineForm } from "@/components/forms/MachineForm";
import { Badge } from "@/components/ui/badge";

export default function Machines() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

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

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Frota e Máquinas</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle de equipamentos, custos e rentabilidade.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleAdd} className="rounded-xl h-10 px-5 shadow-sm transition-all hidden sm:flex active:scale-95">
            <Plus className="w-4 h-4 mr-2" />
            Nova Máquina
          </Button>
        </div>
      </div>

      <Card className="border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-card">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar máquina..." 
              className="pl-9 border-border bg-card rounded-xl h-10"
            />
          </div>
        </div>
        
        {/* Tabela Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide font-bold">
                <th className="p-4">Equipamento</th>
                <th className="p-4">Tipo</th>
                <th className="p-4 text-right">Custo / Hora</th>
                <th className="p-4 text-right">Consumo Diesel (L/h)</th>
                <th className="p-4 text-right">Horas Trabalhadas</th>
                <th className="p-4 text-right">Lucro Gerado</th>
                <th className="p-4 w-[52px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {mockMachines.map((machine) => (
                <tr key={machine.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="p-4 font-bold text-foreground">{machine.name}</td>
                  <td className="p-4 text-muted-foreground">
                    <Badge variant="outline" className="text-xs bg-white rounded-full text-muted-foreground font-medium border-border">{machine.type}</Badge>
                  </td>
                  <td className="p-4 text-right font-mono">{formatCurrency(machine.hour_cost)}</td>
                  <td className="p-4 text-right text-muted-foreground font-mono">{machine.diesel_consumption}L</td>
                  <td className="p-4 text-right font-bold font-mono">{machine.hours_worked}h</td>
                  <td className="p-4 text-right font-bold font-mono text-[hsl(var(--success-text))]">{formatCurrency(machine.profit_generated)}</td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(machine)} className="rounded-lg cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(machine.id)} className="text-destructive focus:bg-destructive/10 rounded-lg cursor-pointer">
                          <Trash2 className="w-4 h-4 mr-2" /> Excluir
                        </DropdownMenuItem>
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
          {mockMachines.map((machine) => (
            <div key={machine.id} className="p-4 touch-card" onClick={() => handleEdit(machine)}>
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-0.5 uppercase tracking-wide">{machine.type}</p>
                  <p className="font-bold text-foreground text-base leading-tight truncate">{machine.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground font-medium mb-0.5">Lucro Gerado</p>
                  <p className="font-bold font-mono text-[hsl(var(--success-text))] text-base">{formatCurrency(machine.profit_generated)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground">Uso</p>
                  <p className="text-sm font-bold font-mono">{machine.hours_worked}h</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Custo/h</p>
                  <p className="text-sm font-medium font-mono">{formatCurrency(machine.hour_cost)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Diesel/h</p>
                  <p className="text-sm font-medium font-mono">{machine.diesel_consumption}L</p>
                </div>
              </div>
            </div>
          ))}
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
        title={editingItem ? "Editar Máquina" : "Nova Máquina"}
      >
        <MachineForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingItem} />
      </ActionModal>
    </div>
  );
}