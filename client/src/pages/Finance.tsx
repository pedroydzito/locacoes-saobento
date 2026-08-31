import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockTransactions, mockServices } from "@/lib/mock-data";
import { Search, Plus, ArrowUpRight, ArrowDownRight, MoreHorizontal, Edit, Trash2, Filter, Wallet, FileDown, DollarSign, X, AlertTriangle, Clock as ClockIcon, ChevronRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionModal } from "@/components/ui/action-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { FinanceForm } from "@/components/forms/FinanceForm";
import { FinanceFilter, FinanceFilters } from "@/components/forms/FinanceFilter";
import { AccountManager } from "@/components/forms/AccountManager";
import { MobileListControls } from "@/components/shared/MobileListControls";
import { MobileCard, MobileCardContent, MobileCardActions } from "@/components/shared/MobileCard";
import { PaymentModal } from "@/components/forms/PaymentModal";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function Finance() {
  const [, setLocation] = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [payingTransaction, setPayingTransaction] = useState<any>(null);

  const [filters, setFilters] = useState<FinanceFilters>({
    category: "",
    account: "all",
    startDate: "",
    endDate: "",
    supplier: "",
    dueDateStatus: "all"
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

  const handleViewDetails = (item: any) => {
    setLocation(`/financeiro/${item.id}`);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    const txIndex = mockTransactions.findIndex(t => t.id === deletingId);
    if (txIndex === -1) { setDeletingId(null); return; }

    const tx = mockTransactions[txIndex];
    if (tx.relatedCostId && tx.relatedServiceId) {
      const service = mockServices.find(s => s.id === tx.relatedServiceId);
      if (service && service.additionalCosts) {
        service.additionalCosts = service.additionalCosts.filter((c: any) => c.id !== tx.relatedCostId);
        const totalCosts = service.additionalCosts.reduce((acc: number, curr: any) => acc + curr.value, 0);
        service.profit = (service.value || 0) - totalCosts;
      }
    }

    mockTransactions.splice(txIndex, 1);
    setDeletingId(null);
    setRefreshKey(prev => prev + 1);
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
    setFilters({ category: "", account: "all", startDate: "", endDate: "", supplier: "", dueDateStatus: "all" });
    setIsFilterModalOpen(false);
  };

  const filteredTransactions = mockTransactions.filter(tx => {
    if (filters.category && !tx.category.toLowerCase().includes(filters.category.toLowerCase()) && !tx.description.toLowerCase().includes(filters.category.toLowerCase())) return false;
    if (filters.account !== "all" && tx.account !== filters.account) return false;
    if (filters.startDate && tx.date < filters.startDate) return false;
    if (filters.endDate && tx.date > filters.endDate) return false;
    if (filters.supplier && !tx.supplier?.toLowerCase().includes(filters.supplier.toLowerCase())) return false;
    
    if (filters.dueDateStatus !== "all") {
      if (filters.dueDateStatus === "no_due") {
        if (tx.dueDate) return false;
      } else {
        if (!tx.dueDate) return false;
        const dueDate = new Date(tx.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (filters.dueDateStatus === "overdue") {
          if (dueDate >= today) return false;
        } else if (filters.dueDateStatus === "upcoming") {
          const sevenDaysFromNow = new Date();
          sevenDaysFromNow.setDate(today.getDate() + 7);
          if (dueDate < today || dueDate > sevenDaysFromNow) return false;
        }
      }
    }
    
    return true;
  });

  const totalEntradas = filteredTransactions.filter(t => t.type === 'entrada').reduce((acc, curr) => acc + curr.amount, 0);
  const totalSaidas = filteredTransactions.filter(t => t.type === 'saida').reduce((acc, curr) => acc + curr.amount, 0);

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  
  const dueTodayBoletos = mockTransactions.filter(tx => {
    if (tx.account !== "Boletos Cobrança" || !tx.dueDate || tx.boletoInfo?.isPaid) return false;
    const dueDate = new Date(tx.dueDate);
    dueDate.setHours(0,0,0,0);
    return dueDate.getTime() === todayMidnight.getTime();
  });
  
  const overdueBoletos = mockTransactions.filter(tx => {
    if (tx.account !== "Boletos Cobrança" || !tx.dueDate || tx.boletoInfo?.isPaid) return false;
    const dueDate = new Date(tx.dueDate);
    dueDate.setHours(0,0,0,0);
    return dueDate < todayMidnight;
  });

  // Data for the chart
  const chartData = [...filteredTransactions].reduce((acc, tx) => {
    const d = new Date(tx.date + "T12:00:00");
    const monthYear = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    if (!acc[monthYear]) acc[monthYear] = { month: monthYear, entradas: 0, saidas: 0, saldo: 0, timestamp: d.getTime() };
    if (tx.type === 'entrada') {
      acc[monthYear].entradas += tx.amount;
      acc[monthYear].saldo += tx.amount;
    } else {
      acc[monthYear].saidas += tx.amount;
      acc[monthYear].saldo -= tx.amount;
    }
    return acc;
  }, {} as Record<string, { month: string, entradas: number, saidas: number, saldo: number, timestamp: number }>);

  const sortedChartData = Object.values(chartData).sort((a, b) => a.timestamp - b.timestamp);

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
          <Button 
            variant="outline" 
            className={`hidden sm:flex border-border bg-white rounded-xl h-10 transition-all ${filters.account !== "all" || filters.category || filters.startDate || filters.endDate || filters.supplier || filters.dueDateStatus !== "all" ? "border-primary text-primary" : ""}`} 
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Filter className={`w-4 h-4 mr-2 ${filters.account !== "all" || filters.category || filters.startDate || filters.endDate || filters.supplier || filters.dueDateStatus !== "all" ? "fill-primary/10" : ""}`} />
            Filtros
            {(filters.account !== "all" || filters.category || filters.startDate || filters.endDate || filters.supplier || filters.dueDateStatus !== "all") && (
              <Badge className="ml-2 bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                {[filters.account !== "all", !!filters.category, !!filters.startDate || !!filters.endDate, !!filters.supplier, filters.dueDateStatus !== "all"].filter(Boolean).length}
              </Badge>
            )}
          </Button>
          <Button variant="outline" onClick={() => setIsAccountModalOpen(true)} className="hidden sm:flex border-border bg-white rounded-xl h-10 transition-all shadow-none">
            <Wallet className="w-4 h-4 mr-2" />
            Contas
          </Button>
          <div className="flex gap-2">
            <Button onClick={() => handleAdd('entrada')} className="rounded-xl h-10 px-4 transition-all active:scale-95 bg-success text-white hover:bg-success/90 shadow-none">
              <Plus className="w-4 h-4 mr-1.5" />
              Entrada
            </Button>
            <Button onClick={() => handleAdd('saida')} className="rounded-xl h-10 px-4 transition-all active:scale-95 bg-destructive text-white hover:bg-destructive/90 shadow-none">
              <Plus className="w-4 h-4 mr-1.5" />
              Saída
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.account !== "all" || filters.category || filters.startDate || filters.endDate || filters.supplier || filters.dueDateStatus !== "all") && (
        <div className="flex flex-wrap items-center gap-2 mb-4 animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-1">Filtros Ativos:</span>
          {filters.category && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 rounded-lg px-2 py-1 flex items-center gap-1 group transition-all hover:bg-primary/20">
              Busca: {filters.category}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, category: "" }))} />
            </Badge>
          )}
          {filters.supplier && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 rounded-lg px-2 py-1 flex items-center gap-1 group transition-all hover:bg-primary/20">
              Fornecedor: {filters.supplier}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, supplier: "" }))} />
            </Badge>
          )}
          {filters.account !== "all" && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 rounded-lg px-2 py-1 flex items-center gap-1 group transition-all hover:bg-primary/20">
              Conta: {filters.account}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, account: "all" }))} />
            </Badge>
          )}
          {filters.dueDateStatus !== "all" && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 rounded-lg px-2 py-1 flex items-center gap-1 group transition-all hover:bg-primary/20">
              Status: {filters.dueDateStatus === 'overdue' ? 'Vencidos' : filters.dueDateStatus === 'upcoming' ? 'A Vencer' : 'Sem Vencimento'}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, dueDateStatus: "all" }))} />
            </Badge>
          )}
          {(filters.startDate || filters.endDate) && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 rounded-lg px-2 py-1 flex items-center gap-1 group transition-all hover:bg-primary/20">
              Período: {filters.startDate || "..."} - {filters.endDate || "..."}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, startDate: "", endDate: "" }))} />
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-[10px] uppercase font-bold text-muted-foreground hover:text-destructive transition-colors"
            onClick={handleClearFilters}
          >
            Limpar Todos
          </Button>
        </div>
      )}

      {/* Alertas de Boletos */}
      {(dueTodayBoletos.length > 0 || overdueBoletos.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
          {overdueBoletos.length > 0 && (
            <div 
              className="p-4 rounded-2xl border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.1)] flex items-center justify-between cursor-pointer hover:bg-[hsl(var(--destructive)/0.15)] transition-colors group"
              onClick={() => setFilters({ ...filters, account: 'Boletos Cobrança', dueDateStatus: 'overdue' })}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-destructive text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-destructive text-lg leading-tight">Atrasados</h4>
                  <p className="text-sm text-destructive/80 font-medium">
                    {overdueBoletos.length} {overdueBoletos.length === 1 ? 'boleto pendente' : 'boletos pendentes'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-destructive/50 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
          
          {dueTodayBoletos.length > 0 && (
            <div 
              className="p-4 rounded-2xl border border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning-subtle))] flex items-center justify-between cursor-pointer hover:bg-[hsl(var(--warning)/0.2)] transition-colors group"
              onClick={() => setFilters({ ...filters, account: 'Boletos Cobrança', dueDateStatus: 'upcoming' })}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--warning))] text-white flex items-center justify-center shrink-0">
                  <ClockIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[hsl(var(--warning-text))] text-lg leading-tight">Vencendo Hoje</h4>
                  <p className="text-sm text-[hsl(var(--warning-text))]/80 font-medium">
                    {dueTodayBoletos.length} {dueTodayBoletos.length === 1 ? 'boleto' : 'boletos'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[hsl(var(--warning))/50] group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI Cards beside chart */}
        <div className="flex flex-col gap-4">
          <Card className="border-border rounded-2xl bg-card">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Entradas do Período</p>
              <h3 className="text-2xl font-bold mt-1 text-success font-display">{formatCurrency(totalEntradas)}</h3>
            </CardContent>
          </Card>
          <Card className="border-border rounded-2xl bg-card">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Saídas do Período</p>
              <h3 className="text-2xl font-bold mt-1 text-destructive font-display">{formatCurrency(totalSaidas)}</h3>
            </CardContent>
          </Card>
          <Card className="border-border rounded-2xl bg-primary text-primary-foreground hidden sm:block">
            <CardContent className="p-5">
              <p className="text-sm font-medium opacity-80">Saldo do Período</p>
              <h3 className="text-2xl font-bold mt-1 font-display">{formatCurrency(totalEntradas - totalSaidas)}</h3>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="border-border rounded-2xl p-5 sm:col-span-2">
          <div className="mb-4">
            <h3 className="font-bold text-sm">Resumo Financeiro (Por Mês)</h3>
          </div>
          <div className="h-[230px]">
            {sortedChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={sortedChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted)/0.3)'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', padding: '10px' }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="entradas" name="Entradas" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="saidas" name="Saídas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Line type="monotone" dataKey="saldo" name="Saldo" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r:4}} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Nenhum dado no período.</div>
            )}
          </div>
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
                <th className="p-4">Nº NF</th>
                <th className="p-4">Fornecedor</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Destino</th>
                <th className="p-4 text-center">Vencimento</th>
                <th className="p-4">Conta</th>
                <th className="p-4 text-right">Valor</th>
                <th className="p-4">Status</th>
                <th className="p-4 w-[52px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => handleViewDetails(tx)}>
                  <td className="p-4 text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded ${tx.type === 'entrada' ? 'bg-success-subtle text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {tx.type === 'entrada' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      </div>
                      <div>
                        <span className="font-bold text-foreground block">{tx.description}</span>
                        {tx.boletoInfo?.installment && (
                          <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded font-mono">
                            Parcela {tx.boletoInfo.installment}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs text-muted-foreground">{tx.invoiceNumber || '-'}</td>
                  <td className="p-4 text-muted-foreground truncate max-w-[120px]">
                    {tx.supplier || '-'}
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary" className="bg-neutral-subtle text-neutral-text border-none text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {tx.category}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {tx.allocation ? (
                      <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border text-[9px] px-2 py-0.5 rounded-full">
                        {tx.allocation}
                      </Badge>
                    ) : '-'}
                  </td>
                  <td className="p-4 text-center">
                    {tx.dueDate ? (
                      <div className="flex flex-col items-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          new Date(tx.dueDate) < new Date() 
                            ? 'bg-destructive/10 text-destructive' : 
                          new Date(tx.dueDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 
                            ? 'bg-warning-text/10 text-warning-text' : 
                          'bg-muted/30 text-muted-foreground'
                        }`}>
                          {new Date(tx.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                        {new Date(tx.dueDate) < new Date() && (
                          <span className="text-[9px] font-bold text-destructive uppercase mt-0.5">Vencido</span>
                        )}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="p-4 text-muted-foreground">{tx.account}</td>
                  <td className={`p-4 text-right font-bold ${tx.type === 'entrada' ? 'text-success' : 'text-destructive'}`}>
                    {tx.type === 'entrada' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className={`text-[10px] font-bold uppercase ${
                      tx.paymentStatus === 'pago' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                      tx.paymentStatus === 'pago_parcial' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {tx.paymentStatus === 'pago' ? 'Pago' : tx.paymentStatus === 'pago_parcial' ? 'Parcial' : 'Pendente'}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => setPayingTransaction(tx)} className="rounded-lg cursor-pointer text-emerald-600 font-bold">
                          <DollarSign className="w-4 h-4 mr-2" /> Registrar Pagamento
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewDetails(tx)} className="rounded-lg cursor-pointer">
                          <ArrowUpRight className="w-4 h-4 mr-2" /> Detalhes
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
            <MobileCard key={tx.id} onClick={() => handleViewDetails(tx)}>
              <MobileCardContent
                metadata={
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">{new Date(tx.date).toLocaleDateString('pt-BR')} {tx.createdAt && <span className="ml-1 opacity-70">({new Date(tx.createdAt).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})})</span>}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{tx.account}</span>
                  </div>
                }
                title={tx.description}
                subtitle={
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-neutral-subtle text-neutral-text border-none text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {tx.category}
                      </Badge>
                      {tx.allocation && (
                        <span className="text-[9px] text-muted-foreground opacity-70">➔ {tx.allocation}</span>
                      )}
                    </div>
                    {tx.supplier && <p className="text-[10px] text-muted-foreground italic truncate">{tx.supplier}</p>}
                    {tx.dueDate && (
                      <p className={`text-[10px] font-bold ${
                        new Date(tx.dueDate) < new Date() ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        Vence em: {new Date(tx.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
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

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir lançamento"
        description="Tem certeza que deseja excluir este lançamento financeiro? Esta ação não pode ser desfeita."
      />

      <ActionModal
        isOpen={!!payingTransaction}
        onClose={() => setPayingTransaction(null)}
        title="Registrar Pagamento"
      >
        {payingTransaction && (
          <PaymentModal
            transaction={payingTransaction}
            onConfirm={() => {
              setPayingTransaction(null);
              setRefreshKey(k => k + 1);
            }}
            onCancel={() => setPayingTransaction(null)}
          />
        )}
      </ActionModal>
    </div>
  );
}