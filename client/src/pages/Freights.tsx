import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockFreights, machinesList } from "@/lib/mock-data";
import { Search, Plus, MoreHorizontal, MapPin, Edit, Trash2, FileDown, Filter, Truck, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionModal } from "@/components/ui/action-modal";
import { FreightForm } from "@/components/forms/FreightForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileListControls } from "@/components/shared/MobileListControls";
import { MobileCard, MobileCardContent, MobileCardActions } from "@/components/shared/MobileCard";

export default function Freights() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [machineFilter, setMachineFilter] = useState("all");

  const filteredFreights = mockFreights.filter(f =>
    machineFilter === "all" || f.machine === machineFilter
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
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
          <div className="flex items-center gap-3">
            <Truck className="w-7 h-7 text-primary hidden sm:block" />
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
              Transporte e Fretes <span className="text-muted-foreground font-normal ml-1">({filteredFreights.length})</span>
            </h1>
          </div>
          <p className="hidden sm:block text-sm text-muted-foreground mt-1">Controle de movimentação de máquinas entre obras.</p>
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
            Novo Frete
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
              placeholder="Buscar por origem ou destino..."
              className="pl-9 border-border bg-muted/20 rounded-xl h-10 shadow-none focus-visible:ring-primary/20"
            />
          </div>
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
                  <td className="p-4 font-bold text-primary">{freight.id}</td>
                  <td className="p-4 text-muted-foreground">{new Date(freight.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 font-bold text-foreground">{freight.machine}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium text-foreground">{freight.origin}</span>
                      <MapPin className="w-3 h-3 text-[hsl(var(--info))]" />
                      <span className="font-medium text-foreground">{freight.destination}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{freight.driver}</td>
                  <td className="p-4 text-right font-bold">{formatCurrency(freight.value)}</td>
                  <td className="p-4 text-center">
                    {getStatusBadge(freight.status)}
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
            <MobileCard key={freight.id} onClick={() => handleEdit(freight)}>
              <MobileCardContent
                metadata={
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">{freight.id}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(freight.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                }
                title={freight.machine}
                subtitle={
                  <div className="space-y-2 mt-2">
                    <div className="bg-muted/40 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-[hsl(var(--warning))] shrink-0" />
                        <span className="truncate text-muted-foreground">{freight.origin}</span>
                      </div>
                      <div className="ml-1 w-0.5 h-2 border-l border-dashed border-muted-foreground/30 my-0.5" />
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))] shrink-0" />
                        <span className="truncate font-medium text-foreground">{freight.destination}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{freight.driver[0]}</span>
                      {freight.driver}
                    </p>
                  </div>
                }
              />
              <MobileCardActions>
                {getStatusBadge(freight.status)}
                <p className="font-bold text-sm text-primary mt-auto">{formatCurrency(freight.value)}</p>
              </MobileCardActions>
            </MobileCard>
          ))}
        </div>
      </Card>

      {/* FAB Mobile */}
      <button
        onClick={handleAdd}
        className="sm:hidden fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95"
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

      <ActionModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtrar por Máquina"
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Máquina</label>
            <Select value={machineFilter} onValueChange={setMachineFilter}>
              <SelectTrigger className="h-11 rounded-xl w-full border-border bg-card text-sm shadow-none">
                <SelectValue placeholder="Selecione a Máquina" />
              </SelectTrigger>
              <SelectContent className="rounded-xl z-50 max-h-[200px] overflow-y-auto">
                <SelectItem value="all" className="cursor-pointer">Todas as Máquinas</SelectItem>
                {machinesList.map((m) => (
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