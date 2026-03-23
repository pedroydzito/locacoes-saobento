import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockFreights, machinesList } from "@/lib/mock-data";
import { Search, Plus, MoreHorizontal, MapPin, Edit, Trash2, FileDown, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionModal } from "@/components/ui/action-modal";
import { FreightForm } from "@/components/forms/FreightForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Freights() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [machineFilter, setMachineFilter] = useState("all");

  const filteredFreights = mockFreights.filter(f => 
    machineFilter === "all" || f.machine === machineFilter
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'concluido':
        return <Badge className="bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.3)] shadow-none">Concluído</Badge>;
      case 'em_andamento':
        return <Badge className="bg-[hsl(var(--info-subtle))] text-[hsl(var(--info-text))] border-[hsl(var(--info)/0.3)] shadow-none">Em Andamento</Badge>;
      case 'planejado':
        return <Badge className="bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.3)] shadow-none">Planejado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
    if (confirm("Tem certeza que deseja excluir este frete?")) {
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
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Transporte e Fretes</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle de movimentação de máquinas entre obras.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-border rounded-xl h-10 shadow-sm transition-all hidden sm:flex">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleAdd} className="rounded-xl h-10 px-5 shadow-sm transition-all hidden sm:flex active:scale-95">
            <Plus className="w-4 h-4 mr-2" />
            Novo Frete
          </Button>
        </div>
      </div>

      <Card className="border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-card flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar por máquina, origem ou destino..." 
              className="pl-9 border-border bg-card rounded-xl h-10"
            />
          </div>
          <Select value={machineFilter} onValueChange={setMachineFilter}>
            <SelectTrigger className="w-full sm:w-[220px] border-border rounded-xl h-10 shadow-sm bg-card [&>div]:flex [&>div]:items-center [&>div]:gap-2">
              <div>
                <Filter className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Filtrar por Máquina" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Todas as Máquinas</SelectItem>
              {machinesList.map((machine) => (
                <SelectItem key={machine} value={machine}>
                  {machine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Tabela Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide font-bold">
                <th className="p-4">ID</th>
                <th className="p-4">Data</th>
                <th className="p-4">Máquina</th>
                <th className="p-4">Rota (Origem → Destino)</th>
                <th className="p-4">Motorista</th>
                <th className="p-4 text-right">Valor</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 w-[52px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {filteredFreights.map((freight) => (
                <tr key={freight.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => handleEdit(freight)}>
                  <td className="p-4 font-bold text-primary font-mono">{freight.id}</td>
                  <td className="p-4 text-muted-foreground font-mono">{new Date(freight.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 font-bold text-foreground">{freight.machine}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium text-foreground">{freight.origin}</span>
                      <MapPin className="w-3 h-3 text-[hsl(var(--info))]" />
                      <span className="font-medium text-foreground">{freight.destination}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{freight.driver}</td>
                  <td className="p-4 text-right font-bold font-mono">{formatCurrency(freight.value)}</td>
                  <td className="p-4 text-center">
                    {getStatusBadge(freight.status)}
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
                        <DropdownMenuItem onClick={() => handleEdit(freight)} className="rounded-lg cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        {userRole === 'admin' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(freight.id)} className="text-destructive focus:bg-destructive/10 rounded-lg cursor-pointer">
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
          {filteredFreights.map((freight) => (
            <div key={freight.id} className="p-4 touch-card" onClick={() => handleEdit(freight)}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-full">{freight.id}</span>
                    <span className="text-xs text-muted-foreground font-mono">{new Date(freight.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="font-bold text-foreground text-base leading-tight truncate">{freight.machine}</p>
                </div>
                {getStatusBadge(freight.status)}
              </div>
              
              <div className="bg-muted/40 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--warning))] shrink-0" />
                  <span className="truncate">{freight.origin}</span>
                </div>
                <div className="ml-1 w-0.5 h-3 border-l-2 border-dashed border-muted-foreground/30 my-0.5" />
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))] shrink-0" />
                  <span className="truncate font-medium">{freight.destination}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{freight.driver[0]}</span>
                  {freight.driver}
                </p>
                <p className="font-bold font-mono text-base">{formatCurrency(freight.value)}</p>
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
        title={editingItem ? "Editar Frete" : "Novo Frete"}
      >
        <FreightForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingItem} />
      </ActionModal>
    </div>
  );
}