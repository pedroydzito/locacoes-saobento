import { useLocation, useRoute } from "wouter";
import { useState, useMemo } from "react";
import { mockOperators, mockServices, mockOperatorTransactions } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActionModal } from "@/components/ui/action-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { OperatorForm } from "@/components/forms/OperatorForm";
import { Edit, Trash2, ChevronRight, ArrowLeft, Users, Clock, DollarSign, Tractor, CalendarDays, TrendingUp, CalendarCheck, CalendarRange, Palmtree, ChevronLeft, Calendar as CalendarIcon, Info, Plus, X, Receipt } from "lucide-react";

type LancamentoType = "Vale" | "Adiantamento" | "Bonificação" | "Desconto";
interface Lancamento { id: string; type: LancamentoType; description: string; amount: number; date: string; }

export default function OperatorDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/operadores/:id");
  const operatorId = params?.id;
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeMonthOffset, setActiveMonthOffset] = useState(0);
  const [isLancamentoOpen, setIsLancamentoOpen] = useState(false);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(() => {
    // seed from mockOperatorTransactions
    return (mockOperatorTransactions as any[]).filter(t => t.operatorId === (mockOperators.find(o => o.id) as any)?.id).map((t: any) => ({
      id: t.id || String(Math.random()),
      type: t.type as LancamentoType,
      description: t.description || t.type,
      amount: t.amount,
      date: t.date,
    }));
  });
  const [newLanc, setNewLanc] = useState<{ type: LancamentoType; description: string; amount: string }>({
    type: "Vale", description: "", amount: ""
  });

  const operator = mockOperators.find(o => o.id === operatorId) as any;

  if (!operator) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground text-lg">Operador não encontrado.</p>
        <Button variant="outline" onClick={() => setLocation("/operadores")} className="rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Operadores
        </Button>
      </div>
    );
  }

  const opServices = mockServices.filter(s => s.operator === operator.name);
  const totalHours = opServices.reduce((acc, s) => {
    if (s.hora_inicial != null && s.hora_final != null) {
      const start = typeof s.hora_inicial === 'number' ? s.hora_inicial : parseFloat(s.hora_inicial as any);
      const end = typeof s.hora_final === 'number' ? s.hora_final : parseFloat(s.hora_final as any);
      if (!isNaN(start) && !isNaN(end)) return acc + (end - start);
    }
    return acc + (s.hours || 0);
  }, 0);
  const totalRevenue = opServices.reduce((acc, s) => acc + (s.value || 0), 0);
  const commissionTotal = totalHours * (operator.commission_per_hour || 0) + opServices.length * (operator.fixed_commission || 0);
  const machines = Array.isArray(operator.machine_assigned) ? operator.machine_assigned : [operator.machine_assigned].filter(Boolean);
  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const initials = operator.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  
  const avgHours = totalHours > 0 ? totalHours : operator.hours_worked || 150;
  
  // Dynamic 14-month history (12 past, current, 1 future projection)
  const historyData = useMemo(() => {
    const data = [];
    for (let i = -12; i <= 1; i++) {
      const date = new Date(currentYear, currentMonth + i, 1);
      const mIdx = date.getMonth();
      const yIdx = date.getFullYear();
      
      const isFuture = i > 0;
      const isCurrent = i === 0;
      
      // Calculate realistic variance for past months based on a sine wave offset by operator ID length
      const variance = isFuture ? 1 : (Math.sin(i + operator.name.length) * 0.25) + 1; // 0.75 to 1.25
      const monthHours = Math.round(avgHours * variance);
      
      // If vacation month (let's say December or January), hours drop significantly
      const hasVacation = mIdx === 11 || mIdx === 0;
      const finalHours = hasVacation && !isFuture ? Math.round(monthHours * 0.3) : monthHours;
      
      const avgServices = Math.max(1, Math.round(opServices.length / 3));
      const monthServices = Math.max(1, Math.round(avgServices * variance));
      const finalServices = hasVacation && !isFuture ? Math.max(1, Math.round(monthServices * 0.3)) : monthServices;
      
      const commissions = (finalHours * (operator.commission_per_hour || 0)) + (finalServices * (operator.fixed_commission || 0));
      const monthTransactions = mockOperatorTransactions.filter(
        (t) =>
          t.operatorId === operator.id &&
          new Date(t.date).getMonth() === mIdx &&
          new Date(t.date).getFullYear() === yIdx
      );

      // Calcular diesel do mês
      const monthServicesReal = opServices.filter((s: any) => {
        if (!s.date) return false;
        const d = new Date(s.date + "T12:00:00");
        return d.getMonth() === mIdx && d.getFullYear() === yIdx;
      });
      const monthDiesel = monthServicesReal.reduce((acc, s) => acc + (s.diesel || 0), 0);
      const activeServices = opServices.filter(s => s.status === 'em_andamento').length;

      const bonuses = monthTransactions.filter(t => t.type === "Bonificação").reduce((a, b) => a + b.amount, 0);
      const vales = monthTransactions.filter(t => t.type === "Vale").reduce((a, b) => a + b.amount, 0);
      const adiantamentos = monthTransactions.filter(t => t.type === "Adiantamento").reduce((a, b) => a + b.amount, 0);
      const descontos = monthTransactions.filter(t => t.type === "Desconto").reduce((a, b) => a + b.amount, 0);

      const total = operator.salary + commissions + bonuses - vales - adiantamentos - descontos;
      
      data.push({
        offset: i,
        monthName: months[mIdx],
        year: yIdx,
        hours: finalHours,
        services: finalServices,
        commissions,
        bonuses,
        vales,
        adiantamentos,
        descontos,
        salary: operator.salary,
        total,
        diesel: monthDiesel,
        activeServices,
        isFuture,
        isCurrent,
        hasVacation
      });
    }
    return data;
  }, [operator, avgHours, opServices.length, currentMonth, currentYear]);

  const activeData = historyData.find(d => d.offset === activeMonthOffset) || historyData.find(d => d.isCurrent)!;

  return (
    <div className="space-y-6 pb-8" key={refreshKey}>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <button onClick={() => setLocation("/operadores")} className="hover:text-primary transition-colors font-medium cursor-pointer">
          Operadores
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-bold">{operator.name}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/operadores")}
            className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground sm:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">{initials}</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight">{operator.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{opServices.length} serviços · {totalHours.toFixed(1)}h trabalhadas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}
            className="rounded-xl h-9 border-border hover:bg-primary/5 hover:text-primary shadow-none">
            <Edit className="w-4 h-4 mr-2" /> Editar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(true)}
            className="rounded-xl h-9 border-border text-destructive hover:bg-destructive/5 hover:text-destructive shadow-none">
            <Trash2 className="w-4 h-4 mr-2" /> Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Clock, label: "Horas Trabalhadas", value: `${totalHours.toFixed(1)}h` },
          { icon: Users, label: "Serviços Realizados", value: `${opServices.length} OSs` },
          { icon: DollarSign, label: "Receita Gerada", value: formatCurrency(totalRevenue) },
          { icon: TrendingUp, label: "Comissões Totais", value: formatCurrency(commissionTotal) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="p-4 rounded-2xl bg-muted/20 border border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
              <Icon className="w-3 h-3" /> {label}
            </p>
            <p className="font-bold text-sm font-mono">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-4">
            <DollarSign className="w-3.5 h-3.5" /> Remuneração
          </p>
          <div className="space-y-3">
            {[
              ["Salário Fixo Mensal", formatCurrency(operator.salary || 0)],
              ["Valor por Hora", formatCurrency(operator.commission_per_hour || 0)],
              ["Comissão Fixa por OS", formatCurrency(operator.fixed_commission || 0)],
              ["Valor Variável Estimado", formatCurrency(commissionTotal)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{k}:</span>
                <span className="font-bold text-sm">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-4">
            <Tractor className="w-3.5 h-3.5" /> Máquinas Designadas
          </p>
          <div className="space-y-2">
            {machines.length > 0 ? machines.map((m: string) => (
              <div key={m} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/20 border border-border/50">
                <Tractor className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium text-sm">{m}</span>
              </div>
            )) : <p className="text-sm text-muted-foreground">Nenhuma máquina designada.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" /> Relatório Detalhado Mensal
          </h4>
          
          <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col gap-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none transition-colors duration-500
              ${activeData.isFuture ? 'from-purple-500 to-indigo-500' : activeData.isCurrent ? 'from-primary to-primary/50' : 'from-foreground to-muted-foreground'}`} />
            
            {/* Header / Month Navigation */}
            <div className="flex items-center justify-between border-b border-border/60 pb-5">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full w-10 h-10 border-border bg-transparent hover:bg-muted/50"
                onClick={() => setActiveMonthOffset(prev => Math.max(-12, prev - 1))}
                disabled={activeMonthOffset === -12}
              >
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </Button>
              
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  <span className="font-display font-bold text-lg tracking-tight">
                    {activeData.monthName} {activeData.year}
                  </span>
                </div>
                <Badge variant="outline" className={`
                  text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 border-none
                  ${activeData.isFuture ? 'bg-purple-500/10 text-purple-500' : 
                    activeData.isCurrent ? 'bg-primary/10 text-primary' : 
                    'bg-muted text-muted-foreground'}
                `}>
                  {activeData.isFuture ? "Projeção Estimada" : activeData.isCurrent ? "Em Andamento (Atual)" : "Fechado"}
                </Badge>
              </div>

              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full w-10 h-10 border-border bg-transparent hover:bg-muted/50"
                onClick={() => setActiveMonthOffset(prev => Math.min(1, prev + 1))}
                disabled={activeMonthOffset === 1}
              >
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>

            {/* Content Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              {/* Left Column - Operational */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border/40 pb-2">
                  <Tractor className="w-3 h-3" /> Operacional
                </p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-muted-foreground">Horas Totais</span>
                    <span className="font-bold text-foreground text-lg">{activeData.hours}h</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-muted-foreground">Serviços (OSs)</span>
                    <span className="font-bold text-foreground text-lg">{activeData.services}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-muted-foreground">Diesel (Mês)</span>
                    <span className="font-bold text-foreground text-lg">{activeData.diesel.toFixed(0)} L</span>
                  </div>
                  {activeData.isCurrent && (
                    <div className="flex justify-between items-end">
                      <span className="text-sm text-muted-foreground">Serviços Ativos</span>
                      <span className="font-bold text-primary text-lg">{activeData.activeServices}</span>
                    </div>
                  )}
                  {activeData.hasVacation && (
                    <div className="flex items-center gap-2 bg-[hsl(var(--warning-subtle))] border border-[hsl(var(--warning)/0.2)] p-2 rounded-lg text-[hsl(var(--warning-text))]">
                      <Palmtree className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold leading-tight">Mês com período de férias / licença.</span>
                    </div>
                  )}
                  {activeData.isFuture && (
                    <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                      <Info className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold leading-tight">Valores baseados na média móvel do operador.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Financial */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border/40 pb-2">
                  <DollarSign className="w-3 h-3" /> Financeiro
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Salário Fixo</span>
                    <span className="font-medium text-sm">{formatCurrency(activeData.salary)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      Valor Horas/OS <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-sm">Var</span>
                    </span>
                    <span className="font-medium text-sm text-[hsl(var(--success))]">+{formatCurrency(activeData.commissions)}</span>
                  </div>
                  {(() => {
                    const tDate = new Date(activeData.year, months.indexOf(activeData.monthName), 1);
                    const mIdx = tDate.getMonth(); const yIdx = tDate.getFullYear();
                    const monthLanc = lancamentos.filter(l => { const d = new Date(l.date); return d.getMonth() === mIdx && d.getFullYear() === yIdx; });
                    const bonif = monthLanc.filter(l => l.type === "Bonificação").reduce((a,b) => a + b.amount, 0);
                    const vales = monthLanc.filter(l => l.type === "Vale").reduce((a,b) => a + b.amount, 0);
                    const adian = monthLanc.filter(l => l.type === "Adiantamento").reduce((a,b) => a + b.amount, 0);
                    const desc  = monthLanc.filter(l => l.type === "Desconto").reduce((a,b) => a + b.amount, 0);
                    const finalTotal = activeData.salary + activeData.commissions + bonif - vales - adian - desc;
                    return (<>
                      {bonif > 0 && <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Bonificações</span><span className="font-medium text-sm text-[hsl(var(--success))]">+{formatCurrency(bonif)}</span></div>}
                      {vales > 0 && <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Vales</span><span className="font-medium text-sm text-destructive">-{formatCurrency(vales)}</span></div>}
                      {adian > 0 && <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Adiantamentos</span><span className="font-medium text-sm text-destructive">-{formatCurrency(adian)}</span></div>}
                      {desc > 0 && <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Descontos</span><span className="font-medium text-sm text-destructive">-{formatCurrency(desc)}</span></div>}
                      <div className="pt-2 mt-1 border-t border-border border-dashed flex justify-between items-center">
                        <span className="font-bold text-foreground">Total do Mês</span>
                        <span className="font-bold text-lg text-primary">{formatCurrency(finalTotal)}</span>
                      </div>
                    </>);
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
            <Palmtree className="w-3 h-3" /> Status de Férias
          </h4>
          <div className="p-5 rounded-2xl bg-card border border-border h-[calc(100%-28px)] flex flex-col justify-center space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--success-subtle))] border border-[hsl(var(--success)/0.2)] flex items-center justify-center shrink-0">
                <Palmtree className="w-6 h-6 text-[hsl(var(--success-text))]" />
              </div>
              <div>
                <p className="text-lg font-bold font-display tracking-tight text-foreground leading-tight">30 dias</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Acumulados</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-border">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <CalendarRange className="w-3.5 h-3.5" /> Últimas Férias
                </p>
                <div className="bg-muted/30 p-2.5 rounded-xl border border-border/50">
                  <p className="text-sm font-bold text-foreground text-center">15/Dez a 14/Jan</p>
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5" /> Próximas Férias (Prev.)
                </p>
                <div className="bg-primary/5 p-2.5 rounded-xl border border-primary/20">
                  <p className="text-sm font-bold text-primary text-center">A partir de 20/Dez</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lançamentos do Mês Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between ml-1">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Receipt className="w-3 h-3" /> Lançamentos do Mês
          </h4>
          <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs shadow-none" onClick={() => setIsLancamentoOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Novo Lançamento
          </Button>
        </div>
        <Card className="rounded-2xl border border-border bg-card shadow-none">
          <CardContent className="p-0">
            {lancamentos.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">Nenhum lançamento registrado.</p>
                <p className="text-xs mt-1">Adicione vales, adiantamentos, bonificações ou descontos.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {lancamentos.map(l => {
                  const isDebit = l.type === "Vale" || l.type === "Adiantamento" || l.type === "Desconto";
                  return (
                    <div key={l.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          l.type === "Bonificação" ? "bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))]" : "bg-destructive/10 text-destructive"
                        }`}>
                          <DollarSign className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{l.description}</p>
                          <p className="text-xs text-muted-foreground">{l.type} · {new Date(l.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-sm ${isDebit ? 'text-destructive' : 'text-[hsl(var(--success-text))]'}`}>
                          {isDebit ? '-' : '+'}{formatCurrency(l.amount)}
                        </span>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          onClick={() => setLancamentos(prev => prev.filter(x => x.id !== l.id))}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ActionModal isOpen={isLancamentoOpen} onClose={() => setIsLancamentoOpen(false)} title="Novo Lançamento">
        <div className="space-y-4 p-1">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Tipo</label>
            <Select value={newLanc.type} onValueChange={(v) => setNewLanc(p => ({ ...p, type: v as LancamentoType }))}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Vale">Vale</SelectItem>
                <SelectItem value="Adiantamento">Adiantamento</SelectItem>
                <SelectItem value="Bonificação">Bonificação</SelectItem>
                <SelectItem value="Desconto">Desconto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Descrição</label>
            <Input className="rounded-xl" placeholder="Ex: Vale alimentação, Bônus produtividade..."
              value={newLanc.description} onChange={e => setNewLanc(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Valor (R$)</label>
            <Input className="rounded-xl" type="number" placeholder="0,00"
              value={newLanc.amount} onChange={e => setNewLanc(p => ({ ...p, amount: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsLancamentoOpen(false)}>Cancelar</Button>
            <Button className="flex-1 rounded-xl" onClick={() => {
              const amount = parseFloat(newLanc.amount);
              if (!newLanc.description.trim() || isNaN(amount) || amount <= 0) return;
              const today = new Date().toISOString().split('T')[0];
              setLancamentos(prev => [...prev, { id: String(Date.now()), type: newLanc.type, description: newLanc.description.trim(), amount, date: today }]);
              setNewLanc({ type: "Vale", description: "", amount: "" });
              setIsLancamentoOpen(false);
            }}>Salvar Lançamento</Button>
          </div>
        </div>
      </ActionModal>

      {(() => {
        const tDate = new Date(activeData.year, months.indexOf(activeData.monthName), 1);
        const mIdx = tDate.getMonth(); const yIdx = tDate.getFullYear();
        const monthServices = opServices.filter(s => {
          const d = new Date(s.date);
          return d.getMonth() === mIdx && d.getFullYear() === yIdx;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (monthServices.length === 0) return null;

        return (
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <CalendarDays className="w-3 h-3" /> Detalhamento Diário ({activeData.monthName})
            </h4>
            <Card className="rounded-2xl border border-border bg-card overflow-hidden shadow-none">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {monthServices.map(s => {
                    const hStart = typeof s.hora_inicial === 'number' ? s.hora_inicial : parseFloat(s.hora_inicial as any);
                    const hEnd = typeof s.hora_final === 'number' ? s.hora_final : parseFloat(s.hora_final as any);
                    const hours = !isNaN(hStart) && !isNaN(hEnd) ? (hEnd - hStart).toFixed(1) : (s.hours || 0).toFixed(1);
                    return (
                      <div key={s.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                        <div>
                          <p className="font-bold text-sm text-primary">{new Date(s.date).toLocaleDateString('pt-BR')} - {s.id}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.client} · {s.machine}</p>
                          {(!isNaN(hStart) || !isNaN(hEnd)) && (
                            <p className="text-[10px] text-muted-foreground mt-1 bg-muted/30 px-1.5 py-0.5 rounded-md inline-block">
                              H. Inicial: {hStart.toFixed(1)} {hEnd && !isNaN(hEnd) ? `| H. Final: ${hEnd.toFixed(1)}` : ''}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">{hours}h</p>
                          <Badge variant="outline" className={`text-[9px] font-bold mt-1 ${s.status === 'concluido' ? 'text-[hsl(var(--success-text))] bg-[hsl(var(--success-subtle))]' : 'text-[hsl(var(--warning-text))] bg-[hsl(var(--warning-subtle))]'}`}>
                            {s.status === 'concluido' ? 'Concluído' : 'Em andamento'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      <ActionModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Operador">
        <OperatorForm onSave={() => { setIsEditModalOpen(false); setRefreshKey(k => k + 1); }} onCancel={() => setIsEditModalOpen(false)} initialData={operator} />
      </ActionModal>
      <ConfirmDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          const idx = mockOperators.findIndex(o => o.id === operatorId);
          if (idx !== -1) mockOperators.splice(idx, 1);
          setLocation("/operadores");
        }} title="Excluir operador"
        description={`Tem certeza que deseja excluir "${operator.name}"?`} />
    </div>
  );
}
