import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockTransactions, kpis } from "@/lib/mock-data";
import { Search, Plus, ArrowUpRight, ArrowDownRight, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionModal } from "@/components/ui/action-modal";
import { FinanceForm } from "@/components/forms/FinanceForm";

export default function Finance() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleAdd = (type: 'entrada' | 'saida') => {
    setEditingItem({ type });
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este lançamento?")) {
      // Logic to delete
    }
  };

  const handleSave = () => {
    setIsModalOpen(false);
  };

  const totalEntradas = mockTransactions.filter(t => t.type === 'entrada').reduce((acc, curr) => acc + curr.amount, 0);
  const totalSaidas = mockTransactions.filter(t => t.type === 'saida').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground mt-1">Controle de caixa, faturamento e despesas.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => handleAdd('saida')} className="border-destructive/20 text-destructive hover:bg-destructive hover:text-white shadow-sm transition-all">
            Nova Saída
          </Button>
          <Button onClick={() => handleAdd('entrada')} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all">
            Nova Entrada
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Atual (Estimado)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEntradas - totalSaidas)}</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Entradas no Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{formatCurrency(totalEntradas)}</div>
          </CardContent>
        </Card>
        <Card className="border-rose-200 bg-rose-50/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-700 flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4" />
              Saídas no Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700">{formatCurrency(totalSaidas)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <div className="p-4 border-b border-border/50 bg-muted/20 flex gap-4 items-center">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar lançamentos..." 
              className="pl-9 border-border/50 bg-white"
            />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border/50 bg-muted/10 text-muted-foreground">
                  <th className="p-4 font-medium">Data</th>
                  <th className="p-4 font-medium">Descrição</th>
                  <th className="p-4 font-medium">Categoria</th>
                  <th className="p-4 font-medium">Conta</th>
                  <th className="p-4 font-medium text-right">Valor</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {mockTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-4 text-muted-foreground">{new Date(tx.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4 font-medium">{tx.description}</td>
                    <td className="p-4 text-muted-foreground">{tx.category}</td>
                    <td className="p-4 text-muted-foreground">{tx.account}</td>
                    <td className={`p-4 text-right font-medium ${tx.type === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'entrada' ? '+' : '-'}{formatCurrency(tx.amount)}
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
                          <DropdownMenuItem onClick={() => handleEdit(tx)}>
                            <Edit className="w-4 h-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(tx.id)} className="text-destructive focus:bg-destructive/10">
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
      </Card>

      <ActionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem?.id ? "Editar Lançamento" : editingItem?.type === 'entrada' ? "Nova Entrada" : "Nova Saída"}
      >
        <FinanceForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingItem} />
      </ActionModal>
    </div>
  );
}