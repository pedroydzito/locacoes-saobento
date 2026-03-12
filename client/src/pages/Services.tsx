import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Obras & Serviços</h1>
          <p className="text-muted-foreground mt-1">Gerencie apontamentos, horas e faturamento.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-border/50 shadow-sm hover:shadow-md transition-all">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleAdd} className="shadow-sm hover:shadow-md transition-all active:scale-95">
            <Plus className="w-4 h-4 mr-2" />
            Novo Serviço
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 justify-between bg-muted/20">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar por cliente, máquina ou OS..." 
              className="pl-9 border-border/50 bg-white"
            />
          </div>
          <Button variant="outline" className="border-border/50 shadow-sm w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Filtros Avançados
          </Button>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border/50 bg-muted/10 text-muted-foreground">
                  <th className="p-4 font-medium">OS</th>
                  <th className="p-4 font-medium">Data</th>
                  <th className="p-4 font-medium">Cliente / Obra</th>
                  <th className="p-4 font-medium">Máquina</th>
                  <th className="p-4 font-medium">Operador</th>
                  <th className="p-4 font-medium text-right">Horas</th>
                  <th className="p-4 font-medium text-right">Diesel</th>
                  <th className="p-4 font-medium text-right">Valor Total</th>
                  <th className="p-4 font-medium text-right">Lucro</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {mockServices.map((service) => (
                  <tr key={service.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-4 font-medium text-primary">{service.id}</td>
                    <td className="p-4 text-muted-foreground">{new Date(service.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4 font-medium">{service.client}</td>
                    <td className="p-4 text-muted-foreground">{service.machine}</td>
                    <td className="p-4 text-muted-foreground">{service.operator}</td>
                    <td className="p-4 text-right font-medium">{service.hours}h</td>
                    <td className="p-4 text-right text-muted-foreground">{service.diesel}L</td>
                    <td className="p-4 text-right font-medium">{formatCurrency(service.value)}</td>
                    <td className="p-4 text-right font-medium text-emerald-600">{formatCurrency(service.profit)}</td>
                    <td className="p-4 text-center">
                      <Badge variant={service.status === 'concluido' ? 'default' : 'secondary'} className={service.status === 'concluido' ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-200 shadow-none' : 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-200 shadow-none'}>
                        {service.status === 'concluido' ? 'Concluído' : 'Em andamento'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(service)}>
                            <Edit className="w-4 h-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(service.id)} className="text-destructive focus:bg-destructive/10">
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
        </CardContent>
        <div className="p-4 border-t border-border/50 bg-muted/10 flex items-center justify-between text-sm text-muted-foreground">
          <span>Mostrando 1 a {mockServices.length} de {mockServices.length} serviços</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>Anterior</Button>
            <Button variant="outline" size="sm">Próximo</Button>
          </div>
        </div>
      </Card>

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