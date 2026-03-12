import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockServices } from "@/lib/mock-data";
import { Search, Plus, Filter, MoreHorizontal, FileDown, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionModal } from "@/components/ui/action-modal";
import { ServiceForm } from "@/components/forms/ServiceForm";

export default function Services() {
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
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
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
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Obras & Serviços</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie apontamentos, horas e faturamento.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-border rounded-xl h-10 shadow-sm transition-all hidden sm:flex">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleAdd} className="rounded-xl h-10 px-5 shadow-sm transition-all hidden sm:flex active:scale-95">
            <Plus className="w-4 h-4 mr-2" />
            Novo Serviço
          </Button>
        </div>
      </div>

      <Card className="border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-card flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar por cliente, máquina ou OS..." 
              className="pl-9 border-border bg-card rounded-xl h-10"
            />
          </div>
          <Button variant="outline" className="border-border rounded-xl h-10 shadow-sm w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Filtros Avançados
          </Button>
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
                <th className="p-4 text-right">Horas</th>
                <th className="p-4 text-right">Diesel</th>
                <th className="p-4 text-right">Valor Total</th>
                <th className="p-4 text-right">Lucro</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 w-[52px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {mockServices.map((service) => (
                <tr key={service.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="p-4 font-bold text-primary font-mono">{service.id}</td>
                  <td className="p-4 text-muted-foreground font-mono">{new Date(service.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 font-bold text-foreground">{service.client}</td>
                  <td className="p-4 text-muted-foreground">{service.machine}</td>
                  <td className="p-4 text-muted-foreground">{service.operator}</td>
                  <td className="p-4 text-right font-bold font-mono">{service.hours}h</td>
                  <td className="p-4 text-right text-muted-foreground font-mono">{service.diesel}L</td>
                  <td className="p-4 text-right font-bold font-mono text-foreground">{formatCurrency(service.value)}</td>
                  <td className="p-4 text-right font-bold font-mono text-[hsl(var(--success-text))]">{formatCurrency(service.profit)}</td>
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
          {mockServices.map((service) => (
            <div key={service.id} className="p-4 touch-card" onClick={() => handleEdit(service)}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-full">{service.id}</span>
                    <span className="text-xs text-muted-foreground font-mono">{new Date(service.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="font-bold text-foreground text-base leading-tight truncate">{service.client}</p>
                </div>
                <Badge className={service.status === 'concluido' ? 'bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.3)] shadow-none' : 'bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.3)] shadow-none'}>
                  {service.status === 'concluido' ? 'Concluído' : 'Em andamento'}
                </Badge>
              </div>
              <div className="flex justify-between items-end mt-3">
                <div className="text-sm text-muted-foreground">
                  <p>{service.machine}</p>
                  <p>{service.operator}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{service.hours}h • {service.diesel}L</p>
                  <p className="font-bold font-mono text-base">{formatCurrency(service.value)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border bg-card flex items-center justify-between text-sm text-muted-foreground">
          <span>Mostrando {mockServices.length} serviços</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-lg h-8" disabled>Anterior</Button>
            <Button variant="outline" size="sm" className="rounded-lg h-8">Próximo</Button>
          </div>
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
        title={editingItem ? "Editar Serviço" : "Novo Serviço"}
      >
        <ServiceForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingItem} />
      </ActionModal>
    </div>
  );
}