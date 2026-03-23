import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockClients } from "@/lib/mock-data";
import { Search, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionModal } from "@/components/ui/action-modal";
import { ClientForm } from "@/components/forms/ClientForm";

export default function Clients() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const sortedClients = [...mockClients].sort((a, b) => a.name.localeCompare(b.name));

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
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
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
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie a carteira de clientes e construtoras.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleAdd} className="rounded-xl h-10 px-5 shadow-sm transition-all hidden sm:flex active:scale-95">
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      <Card className="border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-card">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome, cidade..." 
              className="pl-9 border-border bg-card rounded-xl h-10"
            />
          </div>
        </div>
        
        {/* Tabela Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide font-bold">
                <th className="p-4">Nome</th>
                <th className="p-4">CPF/CNPJ</th>
                <th className="p-4">Telefone</th>
                <th className="p-4">E-mail</th>
                <th className="p-4">Cidade</th>
                <th className="p-4 text-right">Faturamento Total</th>
                <th className="p-4 w-[52px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {sortedClients.map((client) => (
                <tr key={client.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="p-4 font-bold text-foreground">{client.name}</td>
                  <td className="p-4 text-muted-foreground font-mono">{client.cpf_cnpj}</td>
                  <td className="p-4 text-muted-foreground font-mono">{client.phone}</td>
                  <td className="p-4 text-muted-foreground truncate max-w-[150px]">{client.email}</td>
                  <td className="p-4 text-muted-foreground">{client.city}</td>
                  <td className="p-4 text-right font-bold font-mono text-primary">{formatCurrency(client.total_billed)}</td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(client)} className="rounded-lg cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(client.id)} className="text-destructive focus:bg-destructive/10 rounded-lg cursor-pointer">
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
          {sortedClients.map((client) => (
            <div key={client.id} className="p-4 touch-card" onClick={() => handleEdit(client)}>
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-0.5">{client.city}</p>
                  <p className="font-bold text-foreground text-base leading-tight truncate">{client.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold font-mono text-primary text-base">{formatCurrency(client.total_billed)}</p>
                </div>
              </div>
              <div className="flex flex-col mt-3 gap-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground font-mono">{client.cpf_cnpj}</p>
                  <p className="text-sm text-muted-foreground font-mono">{client.phone}</p>
                </div>
                <p className="text-sm text-muted-foreground truncate">{client.email}</p>
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
        title={editingItem ? "Editar Cliente" : "Novo Cliente"}
      >
        <ClientForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingItem} />
      </ActionModal>
    </div>
  );
}