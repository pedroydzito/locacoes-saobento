import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockTransactions, mockServices } from "@/lib/mock-data";
import { Search, Plus, ArrowUpRight, ArrowDownRight, MoreHorizontal, Edit, Trash2, Filter, Wallet } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionModal } from "@/components/ui/action-modal";
import { FinanceForm } from "@/components/forms/FinanceForm";
import { FinanceFilter, FinanceFilters } from "@/components/forms/FinanceFilter";
import { AccountManager } from "@/components/forms/AccountManager";

export default function Finance() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [filters, setFilters] = useState<FinanceFilters>({
    category: "",
    account: "all",
    startDate: "",
    endDate: ""
  });

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
      const txIndex = mockTransactions.findIndex(t => t.id === id);
      if (txIndex === -1) return;
      
      const tx = mockTransactions[txIndex];
      if (tx.relatedCostId && tx.relatedServiceId) {
        const service = mockServices.find(s => s.id === tx.relatedServiceId);
        if (service && service.additionalCosts) {
          service.additionalCosts = service.additionalCosts.filter((c: any) => c.id !== tx.relatedCostId);
          const totalCosts = service.additionalCosts.reduce((acc: number, curr: any) => acc + curr.value, 0);
          service.profit = service.value - totalCosts;
        }
      }
      
      mockTransactions.splice(txIndex, 1);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleSave = () => {
    setIsModalOpen(false);
    setRefreshKey(k => k + 1);
  };

  const handleApplyFilters = (newFilters: FinanceFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({ category: "", account: "all", startDate: "", endDate: "" });
  };

  const filteredTransactions = mockTransactions.filter(tx => {
    if (filters.category && !tx.category.toLowerCase().includes(filters.category.toLowerCase())) return false;
    if (filters.account !== "all" && tx.account !== filters.account) return false;
    if (filters.startDate && tx.date < filters.startDate) return false;
    if (filters.endDate && tx.date > filters.endDate) return false;
    return true;
  });

  const totalEntradas = filteredTransactions.filter(t => t.type === 'entrada').reduce((acc, curr) => acc + curr.amount, 0);
  const totalSaidas = filteredTransactions.filter(t => t.type === 'saida').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle de caixa, faturamento e despesas.</p>
        </div>
        <div className="flex items-center gap-3 hidden sm:flex">
          <Button variant="outline" onClick={() => setIsAccountModalOpen(true)} className="border-border shadow-sm transition-all rounded-xl h-10">
            <Wallet className="w-4 h-4 mr-2" />
            Contas
          </Button>
          <Button variant="outline" onClick={() => handleAdd('saida')} className="border-destructive/20 text-destructive hover:bg-destructive hover:text-white shadow-sm transition-all rounded-xl h-10">
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Nova Saída
          </Button>
          <Button onClick={() => handleAdd('entrada')} className="bg-[hsl(var(--success))] hover:bg-[hsl(var(--success-text))] text-white shadow-sm transition-all rounded-xl h-10">
            <ArrowDownRight className="w-4 h-4 mr-2" />
            Nova Entrada
          </Button>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 gap-4 snap-x snap-mandatory hide-scrollbar">
        <Card className="min-w-[260px] sm:min-w-0 snap-center shrink-0 border-border rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Saldo Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{formatCurrency(totalEntradas - totalSaidas)}</div>
          </CardContent>
        </Card>
        <Card className="min-w-[260px] sm:min-w-0 snap-center shrink-0 border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success-subtle))] rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-[hsl(var(--success-text))] uppercase tracking-wide flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4" />
              Entradas no Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[hsl(var(--success-text))]">{formatCurrency(totalEntradas)}</div>
          </CardContent>
        </Card>
        <Card className="min-w-[260px] sm:min-w-0 snap-center shrink-0 border-destructive/20 bg-destructive/5 rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-destructive uppercase tracking-wide flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Saídas no Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-destructive">{formatCurrency(totalSaidas)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-card flex gap-4 items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar lançamentos..." 
              className="pl-9 border-border bg-card rounded-xl h-10"
            />
          </div>
          <Button variant="outline" onClick={() => setIsFilterModalOpen(true)} className="border-border rounded-xl h-10 shadow-sm whitespace-nowrap hidden sm:flex">
            <Filter className="w-4 h-4 mr-2" />
            {(filters.category || filters.account !== "all" || filters.startDate) ? "Filtros Ativos" : "Filtrar"}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsFilterModalOpen(true)} className="border-border rounded-xl h-10 w-10 shrink-0 sm:hidden">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Tabela Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide font-bold">
                <th className="p-4">Data</th>
                <th className="p-4">Descrição</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Conta</th>
                <th className="p-4">Adicionado em</th>
                <th className="p-4 text-right">Valor</th>
                <th className="p-4 w-[52px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => handleEdit(tx)}>
                  <td className="p-4 text-muted-foreground font-mono">{new Date(tx.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 font-bold text-foreground">{tx.description}</td>
                  <td className="p-4 text-muted-foreground">
                    <span className="bg-muted px-2.5 py-1 rounded-md text-xs font-medium">{tx.category}</span>
                  </td>
                  <td className="p-4 text-muted-foreground">{tx.account}</td>
                  <td className="p-4 text-muted-foreground">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs">{tx.createdAt ? new Date(tx.createdAt).toLocaleString('pt-BR') : '-'}</span>
                      <span className="text-[10px] truncate max-w-[120px]" title={tx.createdBy}>{tx.createdBy ? `por ${tx.createdBy.split('@')[0]}` : ''}</span>
                    </div>
                  </td>
                  <td className={`p-4 text-right font-bold font-mono ${tx.type === 'entrada' ? 'text-[hsl(var(--success-text))]' : 'text-destructive'}`}>
                    {tx.type === 'entrada' ? '+' : '-'}{formatCurrency(tx.amount)}
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
                        <DropdownMenuItem onClick={() => handleEdit(tx)} className="rounded-lg cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(tx.id)} className="text-destructive focus:bg-destructive/10 rounded-lg cursor-pointer">
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
          {filteredTransactions.map((tx) => (
            <div key={tx.id} className="p-4 touch-card" onClick={() => handleEdit(tx)}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-base leading-tight truncate">{tx.description}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{new Date(tx.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold font-mono text-base ${tx.type === 'entrada' ? 'text-[hsl(var(--success-text))]' : 'text-destructive'}`}>
                    {tx.type === 'entrada' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50">
                <span className="bg-muted px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground">{tx.category}</span>
                <span className="text-sm text-muted-foreground">{tx.account}</span>
              </div>
              <div className="mt-2 flex gap-1 text-[10px] text-muted-foreground font-mono">
                <span>Add: {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('pt-BR') : '-'}</span>
                {tx.createdBy && <span>por {tx.createdBy.split('@')[0]}</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* FABs Mobile (Principal + Secundário) */}
      <div className="sm:hidden fixed bottom-[5.5rem] right-4 z-40 flex flex-col items-end gap-3">
        <button
          onClick={() => handleAdd('saida')}
          className="w-12 h-12 bg-card border-2 border-destructive text-destructive rounded-full shadow-lg flex items-center justify-center hover:bg-destructive/10 transition-all active:scale-95"
        >
          <ArrowUpRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAdd('entrada')}
          className="w-14 h-14 bg-[hsl(var(--success))] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[hsl(var(--success-text))] transition-all active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <ActionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem?.id ? "Editar Lançamento" : editingItem?.type === 'entrada' ? "Nova Entrada" : "Nova Saída"}
      >
        <FinanceForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingItem} />
      </ActionModal>

      <ActionModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filtrar Lançamentos">
        <FinanceFilter filters={filters} onApply={handleApplyFilters} onClear={handleClearFilters} onClose={() => setIsFilterModalOpen(false)} />
      </ActionModal>
      
      <ActionModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} title="Gerenciar Contas">
        <AccountManager onChanged={() => setRefreshKey(k => k + 1)} />
      </ActionModal>
    </div>
  );
}