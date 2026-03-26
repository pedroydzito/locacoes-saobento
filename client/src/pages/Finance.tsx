import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockTransactions, mockServices } from "@/lib/mock-data";
import { Search, Plus, ArrowUpRight, ArrowDownRight, MoreHorizontal, Edit, Trash2, Filter, Wallet, FileDown, DollarSign } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionModal } from "@/components/ui/action-modal";
import { Badge } from "@/components/ui/badge";
import { FinanceForm } from "@/components/forms/FinanceForm";
import { FinanceFilter, FinanceFilters } from "@/components/forms/FinanceFilter";
import { AccountManager } from "@/components/forms/AccountManager";
import { MobileListControls } from "@/components/shared/MobileListControls";
import { MobileCard, MobileCardContent, MobileCardActions } from "@/components/shared/MobileCard";

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
    setIsFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({ category: "", account: "all", startDate: "", endDate: "" });
    setIsFilterModalOpen(false);
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
          <div className="flex items-center gap-3">
            <DollarSign className="w-7 h-7 text-primary hidden sm:block" />
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
              Financeiro <span className="text-muted-foreground font-normal ml-1">({filteredTransactions.length})</span>
            </h1>
          </div>
          <p className="hidden sm:block text-sm text-muted-foreground mt-1">Controle de caixa, faturamento e despesas.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" className="hidden sm:flex border-border bg-white rounded-xl h-10  transition-all">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={() => setIsAccountModalOpen(true)} className="hidden sm:flex border-border bg-white rounded-xl h-10  transition-all">
            <Wallet className="w-4 h-4 mr-2" />
            Contas
          </Button>
          <Button variant="outline" className="hidden sm:flex border-border bg-white rounded-xl h-10  transition-all" onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <div className="flex gap-2">
            <Button onClick={() => handleAdd('entrada')} className="rounded-xl h-10 px-4  transition-all active:scale-95 bg-success text-white hover:bg-success/90">
              <Plus className="w-4 h-4 mr-1.5" />
              Entrada
            </Button>
            <Button onClick={() => handleAdd('saida')} className="rounded-xl h-10 px-4  transition-all active:scale-95 bg-destructive text-white hover:bg-destructive/90">
              <Plus className="w-4 h-4 mr-1.5" />
              Saída
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-border rounded-2xl  overflow-hidden bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faturamento (Entradas)</p>
                <h3 className="text-2xl font-bold mt-1 text-success font-display">
                  {formatCurrency(totalEntradas)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-success-subtle flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border rounded-2xl  overflow-hidden bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custo Operacional (Saídas)</p>
                <h3 className="text-2xl font-bold mt-1 text-destructive font-display">
                  {formatCurrency(totalSaidas)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <ArrowDownRight className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border rounded-2xl  overflow-hidden bg-primary text-primary-foreground hidden lg:block">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Saldo do Período</p>
                <h3 className="text-2xl font-bold mt-1 font-display">
                  {formatCurrency(totalEntradas - totalSaidas)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileListControls
        onExportClick={() => { }}
        onFilterClick={() => setIsFilterModalOpen(true)}
        filterLabel="Filtrar Lançamentos"
      />

      <Card className="border-border rounded-2xl  overflow-hidden">
        <div className="p-4 border-b border-border bg-card">
          <div className="relative w-full sm:max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar lançamento..."
              className="pl-9 border-border bg-muted/20 rounded-xl h-10 e focus-visible:ring-primary/20"
            />
          </div>
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
                <th className="p-4 text-right">Valor</th>
                <th className="p-4 w-[52px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => handleEdit(tx)}>
                  <td className="p-4 text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded ${tx.type === 'entrada' ? 'bg-success-subtle text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {tx.type === 'entrada' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      </div>
                      <span className="font-bold text-foreground">{tx.description}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary" className="bg-neutral-subtle text-neutral-text border-none text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {tx.category}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">{tx.account}</td>
                  <td className={`p-4 text-right font-bold ${tx.type === 'entrada' ? 'text-success' : 'text-destructive'}`}>
                    {tx.type === 'entrada' ? '+' : '-'}{formatCurrency(tx.amount)}
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
            <MobileCard key={tx.id} onClick={() => handleEdit(tx)}>
              <MobileCardContent
                metadata={
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{tx.account}</span>
                  </div>
                }
                title={tx.description}
                subtitle={
                  <Badge variant="secondary" className="mt-1 bg-neutral-subtle text-neutral-text border-none text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {tx.category}
                  </Badge>
                }
              />
              <MobileCardActions>
                <p className={`font-bold text-sm ${tx.type === 'entrada' ? 'text-success' : 'text-destructive'}`}>
                  {tx.type === 'entrada' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
              </MobileCardActions>
            </MobileCard>
          ))}
        </div>
      </Card>

      <div className="sm:hidden fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex flex-col gap-2">
        <button
          onClick={() => handleAdd('saida')}
          className="w-12 h-12 bg-destructive text-white rounded-full  flex items-center justify-center hover:bg-destructive/90 transition-all active:scale-95"
          title="Nova Saída"
        >
          <ArrowDownRight className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleAdd('entrada')}
          className="w-14 h-14 bg-success text-white rounded-full  flex items-center justify-center hover:bg-success/90 transition-all active:scale-95"
          title="Nova Entrada"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem?.id ? "Editar Lançamento" : `Novo Lançamento: ${editingItem?.type === 'entrada' ? 'Entrada' : 'Saída'}`}
      >
        <FinanceForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingItem} />
      </ActionModal>

      <ActionModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtrar Lançamentos"
      >
        <FinanceFilter
          filters={filters}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          onClose={() => setIsFilterModalOpen(false)}
        />
      </ActionModal>

      <ActionModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        title="Gerenciar Contas"
      >
        <AccountManager onChanged={() => setRefreshKey(k => k + 1)} />
      </ActionModal>
    </div>
  );
}