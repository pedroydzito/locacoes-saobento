import { useLocation, useRoute } from "wouter";
import { useState, useMemo } from "react";
import { mockMachines, mockServices, mockTransactions, mockMaintenanceRecords } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionModal } from "@/components/ui/action-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MachineForm } from "@/components/forms/MachineForm";
import { MaintenanceForm } from "@/components/forms/MaintenanceForm";
import {
  Edit, Trash2, ChevronRight, ArrowLeft,
  Tractor, DollarSign, Fuel, BarChart3, Wrench, CalendarDays,
  ChevronLeft, Calendar as CalendarIcon, Info, Banknote, Activity,
  ExternalLink, Clock, TrendingUp, Plus
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

function MaintenanceTypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; color: string }> = {
    troca_oleo: { label: "Troca de Óleo", color: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
    reparo: { label: "Reparo", color: "bg-red-500/10 text-red-700 border-red-500/20" },
    revisao: { label: "Revisão", color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
    filtro: { label: "Filtro", color: "bg-purple-500/10 text-purple-700 border-purple-500/20" },
    outro: { label: "Outro", color: "bg-muted text-muted-foreground border-border" },
  };
  const item = map[type] || map.outro;
  return (
    <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border ${item.color}`}>
      {item.label}
    </Badge>
  );
}

export default function MachineDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/maquinas/:id");
  const machineId = params?.id;

  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [activeMonthOffset, setActiveMonthOffset] = useState(0);
  const [activeTab, setActiveTab] = useState("operacional");

  const machine = mockMachines.find(m => m.id === machineId) as any;

  if (!machine) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground text-lg">Máquina não encontrada.</p>
        <Button variant="outline" onClick={() => setLocation("/maquinas")} className="rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Máquinas
        </Button>
      </div>
    );
  }

  const machineServices = mockServices.filter(s => s.machine === machine.name);
  const totalHours = machineServices.reduce((acc, s) => {
    if (s.hora_inicial != null && s.hora_final != null) {
      const start = typeof s.hora_inicial === 'number' ? s.hora_inicial : parseFloat(s.hora_inicial as any);
      const end = typeof s.hora_final === 'number' ? s.hora_final : parseFloat(s.hora_final as any);
      if (!isNaN(start) && !isNaN(end)) return acc + (end - start);
    }
    return acc + (s.hours || 0);
  }, 0);
  const totalRevenue = machineServices.reduce((acc, s) => acc + (s.value || 0), 0);
  const totalProfit = machineServices.reduce((acc, s) => acc + (s.profit || 0), 0);
  const totalDiesel = machineServices.reduce((acc, s) => acc + (s.diesel || 0), 0);

  const machineMaintenance = mockMaintenanceRecords.filter(m => m.machineId === machine.id);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const fullMonths = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const avgHours = totalHours > 0 ? (totalHours / Math.max(1, machineServices.length)) * 5 : machine.hours_worked / 12 || 150;
  
  const historyData = useMemo(() => {
    const data = [];
    for (let i = -12; i <= 1; i++) {
      const date = new Date(currentYear, currentMonth + i, 1);
      const mIdx = date.getMonth();
      const yIdx = date.getFullYear();
      
      const isFuture = i > 0;
      const isCurrent = i === 0;

      let finalHours = 0;
      let monthDiesel = 0;
      let revenue = 0;
      let isMaintenance = false;
      let expenses = 0;
      let profit = 0;

      if (!isFuture) {
        const monthServices = machineServices.filter((s: any) => {
          if (!s.date) return false;
          const d = new Date(s.date + "T12:00:00");
          return d.getMonth() === mIdx && d.getFullYear() === yIdx;
        });

        monthServices.forEach((s: any) => {
          const start = typeof s.hora_inicial === 'number' ? s.hora_inicial : parseFloat(s.hora_inicial);
          const end = typeof s.hora_final === 'number' ? s.hora_final : parseFloat(s.hora_final);
          let h = 0;
          if (!isNaN(start) && !isNaN(end)) h = end - start;
          else if (s.hours) h = s.hours;

          finalHours += h;
          revenue += (s.value || 0);
          monthDiesel += (s.diesel || 0);
        });
        
        if (monthServices.length === 0) {
           const variance = (Math.sin(i + machine.name.length) * 0.25) + 1;
           const monthHours = Math.round(avgHours * variance);
           isMaintenance = mIdx === 2 || mIdx === 8;
           finalHours = isMaintenance ? Math.round(monthHours * 0.4) : monthHours;
           monthDiesel = finalHours * machine.diesel_consumption;
           revenue = finalHours * (totalRevenue > 0 && totalHours > 0 ? (totalRevenue / totalHours) : 350);
        }

        const cost_machine = finalHours * machine.hour_cost;
        const cost_diesel = monthDiesel * 6.50; 
        
        const maintenanceCost = mockTransactions
          .filter(t => t.allocation === machine.name && t.type === "saida")
          .filter(t => {
             const d = new Date(t.date);
             return d.getMonth() === mIdx && d.getFullYear() === yIdx;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        expenses = cost_machine + cost_diesel + maintenanceCost;
        profit = revenue - expenses;
      } else {
        const monthHours = Math.round(avgHours);
        finalHours = monthHours;
        monthDiesel = finalHours * machine.diesel_consumption;
        revenue = finalHours * (totalRevenue > 0 && totalHours > 0 ? (totalRevenue / totalHours) : 350);
        const cost_machine = finalHours * machine.hour_cost;
        const cost_diesel = monthDiesel * 6.50; 
        expenses = cost_machine + cost_diesel;
        profit = revenue - expenses;
      }
      
      data.push({
        offset: i,
        monthName: months[mIdx],
        fullMonthName: fullMonths[mIdx],
        year: yIdx,
        hours: Math.round(finalHours * 10) / 10,
        diesel: Math.round(monthDiesel),
        revenue,
        expenses,
        profit,
        isFuture,
        isCurrent,
        isMaintenance
      });
    }
    return data;
  }, [machine, avgHours, currentMonth, currentYear, totalRevenue, totalHours, machineServices]);

  const activeData = historyData.find(d => d.offset === activeMonthOffset) || historyData.find(d => d.isCurrent)!;

  // Chart data for the last 6 months + current
  const chartData = historyData.filter(d => d.offset >= -6 && d.offset <= 0);

  return (
    <div className="space-y-6 pb-8" key={refreshKey}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <button
          onClick={() => setLocation("/maquinas")}
          className="hover:text-primary transition-colors font-medium cursor-pointer"
        >
          Máquinas
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-bold">{machine.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/maquinas")}
            className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground sm:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight">{machine.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{machine.type} • {machine.model} • {machine.year}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-primary/5 text-primary border-primary/20">
            {machine.type}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Badge variant="outline" className={`cursor-pointer hover:opacity-80 transition-opacity font-bold uppercase tracking-widest px-3 py-1 border-none ${
                machine.status === 'em_manutencao' ? 'bg-destructive/10 text-destructive' :
                machine.status === 'disponivel' ? 'bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))]' :
                'bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))]'
              }`}>
                {machine.status === 'em_manutencao' ? 'Em Manutenção' : machine.status === 'disponivel' ? 'Disponível' : 'Operando'}
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px] rounded-xl">
              <DropdownMenuItem onClick={() => { const idx = mockMachines.findIndex(m => m.id === machine.id); if (idx !== -1) mockMachines[idx].status = 'operando'; setRefreshKey(k => k + 1); }} className="rounded-lg cursor-pointer flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--warning))]" /> Operando
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { const idx = mockMachines.findIndex(m => m.id === machine.id); if (idx !== -1) mockMachines[idx].status = 'disponivel'; setRefreshKey(k => k + 1); }} className="rounded-lg cursor-pointer flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" /> Disponível
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { const idx = mockMachines.findIndex(m => m.id === machine.id); if (idx !== -1) mockMachines[idx].status = 'em_manutencao'; setRefreshKey(k => k + 1); }} className="rounded-lg cursor-pointer flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-destructive" /> Em Manutenção
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

      {/* Performance Chart replacing KPI cards */}
      <Card className="border-border rounded-2xl p-5 sm:p-6">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold font-display flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Desempenho (Últimos 7 meses)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Horas trabalhadas, receita e lucro por mês</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-primary/70" /><span className="text-muted-foreground">Receita</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /><span className="text-muted-foreground">Lucro</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="text-muted-foreground">Horas</span></div>
          </div>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="monthName" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis yAxisId="money" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickFormatter={v => `R$${v/1000}k`} width={55} />
              <YAxis yAxisId="hours" orientation="right" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickFormatter={v => `${v}h`} width={40} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.1)', fontSize: 12 }}
                formatter={(value: any, name: string) => {
                  if (name === 'hours') return [`${value}h`, 'Horas'];
                  return [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number), name === 'revenue' ? 'Receita' : 'Lucro'];
                }}
              />
              <Bar yAxisId="money" dataKey="revenue" name="Receita" radius={[4, 4, 0, 0]} maxBarSize={32}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={`hsl(var(--primary) / ${d.isCurrent ? 1 : 0.6})`} />
                ))}
              </Bar>
              <Bar yAxisId="money" dataKey="profit" name="Lucro" radius={[4, 4, 0, 0]} maxBarSize={32} fill="hsl(142, 70%, 45%)" fillOpacity={0.8} />
              <Line yAxisId="hours" type="monotone" dataKey="hours" name="hours" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(38, 92%, 50%)" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        {/* Summary Row */}
        <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/50">
          {[
            { icon: Clock, label: "Horas Total", value: `${totalHours.toFixed(1)}h`, color: "text-primary" },
            { icon: DollarSign, label: "Receita Total", value: formatCurrency(totalRevenue), color: "text-emerald-600" },
            { icon: TrendingUp, label: "Lucro Total", value: formatCurrency(totalProfit), color: totalProfit >= 0 ? "text-emerald-600" : "text-destructive" },
            { icon: Fuel, label: "Diesel Total", value: `${totalDiesel.toFixed(0)}L`, color: "text-amber-500" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="text-center">
              <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
              <p className={`font-bold text-sm ${color}`}>{value}</p>
              <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="rounded-2xl bg-muted/30 border border-border h-12 p-1">
          <TabsTrigger value="operacional" className="rounded-xl font-bold flex-1 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Activity className="w-4 h-4 mr-2" /> Operacional
          </TabsTrigger>
          <TabsTrigger value="historico" className="rounded-xl font-bold flex-1 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <CalendarDays className="w-4 h-4 mr-2" /> Histórico
          </TabsTrigger>
          <TabsTrigger value="mecanico" className="rounded-xl font-bold flex-1 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Wrench className="w-4 h-4 mr-2" /> Mecânico
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OPERACIONAL */}
        <TabsContent value="operacional" className="space-y-4 mt-4">
          {/* Acompanhamento Operacional */}
          <div className="p-5 rounded-2xl bg-card border border-border flex flex-col sm:flex-row sm:items-center gap-4 justify-between flex-wrap">
            <div>
              <p className="text-sm text-muted-foreground">Status Atual</p>
              <p className="font-bold text-lg text-primary">{machine.status === 'em_manutencao' ? 'Em Manutenção' : machine.status === 'disponivel' ? 'Disponível' : 'Operando'}</p>
            </div>
            {machineServices.find(s => s.status === 'em_andamento') ? (() => {
              const active = machineServices.find(s => s.status === 'em_andamento');
              return (
                <>
                  <div><p className="text-sm text-muted-foreground">Operador Atual</p><p className="font-bold text-lg">{active?.operator || "—"}</p></div>
                  <div><p className="text-sm text-muted-foreground">Cliente Atual</p><p className="font-bold text-lg">{active?.client || "—"}</p></div>
                </>
              );
            })() : (
              <div><p className="text-sm text-muted-foreground">Serviço Atual</p><p className="font-bold text-lg text-muted-foreground">Nenhum serviço ativo</p></div>
            )}
            <div><p className="text-sm text-muted-foreground">Horas (Mês)</p><p className="font-bold text-lg">{historyData.find(d => d.isCurrent)?.hours || 0}h</p></div>
            <div><p className="text-sm text-muted-foreground">Diesel (Mês)</p><p className="font-bold text-lg">{historyData.find(d => d.isCurrent)?.diesel?.toFixed(0) || 0} L</p></div>
            <div>
              <p className="text-sm text-muted-foreground">Média Diesel</p>
              <p className="font-bold text-lg">
                {(() => {
                  const curr = historyData.find(d => d.isCurrent);
                  if (curr && curr.hours > 0) return (curr.diesel / curr.hours).toFixed(1) + " L/h";
                  return "0 L/h";
                })()}
              </p>
            </div>
          </div>

          {/* Detalhamento Mensal */}
          <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col gap-6 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none ${activeData.isFuture ? 'from-purple-500 to-indigo-500' : activeData.isCurrent ? 'from-primary to-primary/50' : 'from-foreground to-muted-foreground'}`} />
            
            <div className="flex items-center justify-between border-b border-border/60 pb-5">
              <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-border bg-transparent hover:bg-muted/50"
                onClick={() => setActiveMonthOffset(prev => Math.max(-12, prev - 1))} disabled={activeMonthOffset === -12}>
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </Button>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  <span className="font-display font-bold text-lg tracking-tight">{activeData.fullMonthName} {activeData.year}</span>
                </div>
                <Badge variant="outline" className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 border-none ${activeData.isFuture ? 'bg-purple-500/10 text-purple-500' : activeData.isCurrent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {activeData.isFuture ? "Projeção Estimada" : activeData.isCurrent ? "Em Andamento (Atual)" : "Fechado"}
                </Badge>
              </div>
              <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-border bg-transparent hover:bg-muted/50"
                onClick={() => setActiveMonthOffset(prev => Math.min(1, prev + 1))} disabled={activeMonthOffset === 1}>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border/40 pb-2">
                  <Tractor className="w-3 h-3" /> Operacional
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-end"><span className="text-sm text-muted-foreground">Horas Trabalhadas</span><span className="font-bold text-foreground text-lg">{activeData.hours}h</span></div>
                  <div className="flex justify-between items-end"><span className="text-sm text-muted-foreground">Diesel Consumido</span><span className="font-bold text-foreground text-lg">{activeData.diesel.toFixed(0)} L</span></div>
                  <div className="flex justify-between items-end"><span className="text-sm text-muted-foreground">Média de Consumo</span><span className="font-bold text-foreground text-lg">{activeData.hours > 0 ? (activeData.diesel / activeData.hours).toFixed(1) : 0} L/h</span></div>
                  {activeData.isFuture && (
                    <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                      <Info className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold leading-tight">Projeção baseada na média histórica do equipamento.</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border/40 pb-2">
                  <DollarSign className="w-3 h-3" /> Financeiro
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Receita Bruta</span><span className="font-medium text-sm text-emerald-600">{formatCurrency(activeData.revenue)}</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Despesas</span><span className="font-medium text-sm text-destructive">-{formatCurrency(activeData.expenses)}</span></div>
                  <div className="pt-2 mt-1 border-t border-border border-dashed flex justify-between items-center">
                    <span className="font-bold text-foreground">Lucro Líquido</span>
                    <span className={`font-bold text-lg ${activeData.profit >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>{formatCurrency(activeData.profit)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Machine Specs & Financing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <Tractor className="w-3.5 h-3.5" /> Especificações
              </p>
              <div className="space-y-3">
                {[["Tipo", machine.type], ["Modelo", machine.model], ["Ano", machine.year], ["Custo / Hora", formatCurrency(machine.hour_cost)], ["Consumo Diesel", `${machine.diesel_consumption} L/h`]].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{k}:</span>
                    <span className="font-bold text-sm">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <BarChart3 className="w-3.5 h-3.5" /> Resumo Geral
              </p>
              <div className="space-y-3">
                {[["Total de OSs", machineServices.length], ["Concluídas", machineServices.filter(s => s.status === 'concluido').length], ["Em andamento", machineServices.filter(s => s.status !== 'concluido').length], ["Custo / Hora", formatCurrency(machine.hour_cost)], ["Receita / Hora", totalHours > 0 ? formatCurrency(totalRevenue / totalHours) : "—"]].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{k}:</span>
                    <span className="font-bold text-sm">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Financing */}
          {machine.financing && (
            <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5" /> Financiamento
                </h4>
                <Badge variant="outline" className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 border-none ${machine.financing.installmentsPaid >= machine.financing.installmentsTotal ? 'bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))]' : 'bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))]'}`}>
                  {machine.financing.installmentsPaid >= machine.financing.installmentsTotal ? "Quitado" : "Em Andamento"}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1"><span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Valor Total</span><p className="font-bold text-lg">{formatCurrency(machine.financing.totalAmount)}</p></div>
                <div className="space-y-1"><span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Parcela</span><p className="font-bold text-lg">{formatCurrency(machine.financing.monthlyValue)} <span className="text-sm font-medium text-muted-foreground">/mês</span></p></div>
                <div className="space-y-1"><span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Quitação</span><p className="font-bold text-lg">{new Date(machine.financing.endDate).toLocaleDateString('pt-BR')}</p></div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm font-bold"><span className="text-muted-foreground">Progresso</span><span className="text-primary">{machine.financing.installmentsPaid} de {machine.financing.installmentsTotal} parcelas</span></div>
                <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(machine.financing.installmentsPaid / machine.financing.installmentsTotal) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>Pago: {formatCurrency(machine.financing.paidAmount)}</span>
                  <span>Restante: {formatCurrency(machine.financing.totalAmount - machine.financing.paidAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: HISTÓRICO */}
        <TabsContent value="historico" className="mt-4">
          {machineServices.length > 0 ? (
            <Card className="rounded-2xl border border-border bg-card overflow-hidden shadow-none">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {machineServices.slice(0, 20).map(s => (
                    <div
                      key={s.id}
                      className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors cursor-pointer group"
                      onClick={() => setLocation(`/servicos/${s.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-sm text-primary">{s.id}</p>
                          <Badge variant="outline" className={`text-[9px] font-bold ${s.status === 'concluido' ? 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-700 bg-amber-500/10 border-amber-500/20'}`}>
                            {s.status === 'concluido' ? 'Concluído' : 'Em andamento'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{s.client} · {new Date(s.date).toLocaleDateString('pt-BR')}</p>
                        <p className="text-xs text-muted-foreground">{s.area || s.serviceType} · {s.operator}</p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="font-bold text-sm">{formatCurrency(s.value || 0)}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {s.hora_inicial && s.hora_final ? `${(Number(s.hora_final) - Number(s.hora_inicial)).toFixed(1)}h` : `${s.hours || 0}h`}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhum serviço registrado para esta máquina.</p>
            </div>
          )}
        </TabsContent>

        {/* TAB 3: MECÂNICO */}
        <TabsContent value="mecanico" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" /> Histórico de Manutenções
            </h3>
            <Button size="sm" onClick={() => setIsMaintenanceModalOpen(true)} className="rounded-xl font-bold">
              <Plus className="w-4 h-4 mr-1.5" /> Nova Manutenção
            </Button>
          </div>

          {machineMaintenance.length > 0 ? (
            machineMaintenance.map(record => (
              <div key={record.id} className="p-5 rounded-2xl bg-card border border-border space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MaintenanceTypeBadge type={record.type} />
                      <span className="text-xs text-muted-foreground">{new Date(record.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="font-bold text-sm text-foreground">{record.mechanicName}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{record.description}</p>
                  </div>
                  <p className="font-bold text-base text-destructive shrink-0 ml-4">{formatCurrency(record.totalCost)}</p>
                </div>
                {record.partsUsed.length > 0 && (
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Peças Utilizadas</p>
                    <div className="space-y-1.5">
                      {record.partsUsed.map((part, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">{part.code}</span>
                            <span className="text-foreground">{part.name}</span>
                          </div>
                          <span className="text-muted-foreground font-mono">{part.quantity}× {formatCurrency(part.unitPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-2xl">
              <Wrench className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhuma manutenção registrada.</p>
              <p className="text-sm mt-1">As manutenções realizadas pelo mecânico aparecerão aqui.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ActionModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Máquina">
        <MachineForm onSave={() => { setIsEditModalOpen(false); setRefreshKey(k => k + 1); }} onCancel={() => setIsEditModalOpen(false)} initialData={machine} />
      </ActionModal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          const idx = mockMachines.findIndex(m => m.id === machineId);
          if (idx !== -1) mockMachines.splice(idx, 1);
          setLocation("/maquinas");
        }}
        title="Excluir máquina"
        description={`Tem certeza que deseja excluir "${machine.name}"? Esta ação não pode ser desfeita.`}
      />

      <ActionModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        title="Registrar Manutenção"
      >
        <MaintenanceForm
          machineId={machine.id}
          onSave={() => {
            setIsMaintenanceModalOpen(false);
            setRefreshKey(k => k + 1);
          }}
          onCancel={() => setIsMaintenanceModalOpen(false)}
        />
      </ActionModal>
    </div>
  );
}
