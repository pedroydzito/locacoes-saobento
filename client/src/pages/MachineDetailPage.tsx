import { useLocation, useRoute } from "wouter";
import { useState, useMemo } from "react";
import { mockMachines, mockServices } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionModal } from "@/components/ui/action-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MachineForm } from "@/components/forms/MachineForm";
import {
  Edit, Trash2, ChevronRight, ArrowLeft,
  Tractor, Clock, DollarSign, Fuel, BarChart3, Wrench, CalendarDays,
  ChevronLeft, Calendar as CalendarIcon, Info, TrendingUp, TrendingDown, Banknote
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function MachineDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/maquinas/:id");
  const machineId = params?.id;

  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeMonthOffset, setActiveMonthOffset] = useState(0);

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

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const avgHours = totalHours > 0 ? (totalHours / Math.max(1, machineServices.length)) * 5 : machine.hours_worked / 12 || 150;
  
  const historyData = useMemo(() => {
    const data = [];
    for (let i = -12; i <= 1; i++) {
      const date = new Date(currentYear, currentMonth + i, 1);
      const mIdx = date.getMonth();
      const yIdx = date.getFullYear();
      
      const isFuture = i > 0;
      const isCurrent = i === 0;
      
      const variance = isFuture ? 1 : (Math.sin(i + machine.name.length) * 0.25) + 1; // 0.75 to 1.25
      const monthHours = Math.round(avgHours * variance);
      
      const isMaintenance = mIdx === 2 || mIdx === 8;
      const finalHours = isMaintenance && !isFuture ? Math.round(monthHours * 0.4) : monthHours;
      
      const monthDiesel = finalHours * machine.diesel_consumption;
      
      const revenue = finalHours * (totalRevenue > 0 && totalHours > 0 ? (totalRevenue / totalHours) : 350);
      const cost_machine = finalHours * machine.hour_cost;
      const cost_diesel = monthDiesel * 6.50; 
      const expenses = cost_machine + cost_diesel;
      const profit = revenue - expenses;
      
      data.push({
        offset: i,
        monthName: months[mIdx],
        year: yIdx,
        hours: finalHours,
        diesel: monthDiesel,
        revenue,
        expenses,
        profit,
        isFuture,
        isCurrent,
        isMaintenance
      });
    }
    return data;
  }, [machine, avgHours, currentMonth, currentYear, totalRevenue, totalHours]);

  const activeData = historyData.find(d => d.offset === activeMonthOffset) || historyData.find(d => d.isCurrent)!;

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
              <Badge variant="outline" className={`cursor-pointer hover:opacity-80 transition-opacity e font-bold uppercase tracking-widest px-3 py-1 border-none ${
                machine.status === 'em_manutencao' ? 'bg-destructive/10 text-destructive' :
                machine.status === 'disponivel' ? 'bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))]' :
                'bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))]'
              }`}>
                {machine.status === 'em_manutencao' ? 'Em Manutenção' : machine.status === 'disponivel' ? 'Disponível' : 'Operando'}
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px] rounded-xl">
              <DropdownMenuItem onClick={() => {
                const idx = mockMachines.findIndex(m => m.id === machine.id);
                if (idx !== -1) mockMachines[idx].status = 'operando';
                setRefreshKey(k => k + 1);
              }} className="rounded-lg cursor-pointer flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--warning))]" /> Operando
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const idx = mockMachines.findIndex(m => m.id === machine.id);
                if (idx !== -1) mockMachines[idx].status = 'disponivel';
                setRefreshKey(k => k + 1);
              }} className="rounded-lg cursor-pointer flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" /> Disponível
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const idx = mockMachines.findIndex(m => m.id === machine.id);
                if (idx !== -1) mockMachines[idx].status = 'em_manutencao';
                setRefreshKey(k => k + 1);
              }} className="rounded-lg cursor-pointer flex items-center gap-2">
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Clock, label: "Horas Trabalhadas", value: `${totalHours.toFixed(1)}h`, sub: "total registrado" },
          { icon: DollarSign, label: "Receita Gerada", value: formatCurrency(totalRevenue), sub: "faturado" },
          { icon: BarChart3, label: "Lucro Gerado", value: formatCurrency(totalProfit), sub: "resultado líquido" },
          { icon: Fuel, label: "Diesel Consumido", value: `${totalDiesel.toFixed(0)} L`, sub: "total estimado" },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="p-4 rounded-2xl bg-muted/20 border border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
              <Icon className="w-3 h-3" /> {label}
            </p>
            <p className="font-bold text-sm font-mono">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Detalhamento Mensal Dinâmico */}
      <div className="space-y-3 mt-8 mb-8">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
          <BarChart3 className="w-3 h-3" /> Relatório Detalhado Mensal
        </h4>
        
        <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col gap-6 relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none transition-colors duration-500
            ${activeData.isFuture ? 'from-purple-500 to-indigo-500' : activeData.isCurrent ? 'from-primary to-primary/50' : 'from-foreground to-muted-foreground'}`} />
          
          {/* Header */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
            {/* Operacional */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border/40 pb-2">
                <Tractor className="w-3 h-3" /> Operacional
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-muted-foreground">Horas Trabalhadas</span>
                  <span className="font-bold text-foreground text-lg">{activeData.hours}h</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm text-muted-foreground">Diesel Consumido</span>
                  <span className="font-bold text-foreground text-lg">{activeData.diesel.toFixed(0)} L</span>
                </div>
                {activeData.isMaintenance && (
                  <div className="flex items-center gap-2 bg-[hsl(var(--warning-subtle))] border border-[hsl(var(--warning)/0.2)] p-2 rounded-lg text-[hsl(var(--warning-text))]">
                    <Wrench className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold leading-tight">Mês com manutenção programada.</span>
                  </div>
                )}
                {activeData.isFuture && (
                  <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                    <Info className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold leading-tight">Projeção baseada na média móvel do equipamento.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financeiro */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border/40 pb-2">
                <DollarSign className="w-3 h-3" /> Financeiro
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Receita Bruta</span>
                  <span className="font-medium text-sm text-[hsl(var(--success))]">{formatCurrency(activeData.revenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    Despesas
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-sm">Operação + Diesel</span>
                  </span>
                  <span className="font-medium text-sm text-[hsl(var(--destructive))]">-{formatCurrency(activeData.expenses)}</span>
                </div>
                <div className="pt-2 mt-1 border-t border-border border-dashed flex justify-between items-center">
                  <span className="font-bold text-foreground">Lucro Líquido</span>
                  <span className={`font-bold text-lg ${activeData.profit >= 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'}`}>
                    {formatCurrency(activeData.profit)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Machine Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-4">
            <Tractor className="w-3.5 h-3.5" /> Especificações
          </p>
          <div className="space-y-3">
            {[
              ["Tipo", machine.type],
              ["Modelo", machine.model],
              ["Ano", machine.year],
              ["Custo / Hora", formatCurrency(machine.hour_cost)],
              ["Consumo Diesel", `${machine.diesel_consumption} L/h`],
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
            <Wrench className="w-3.5 h-3.5" /> Serviços Realizados
          </p>
          <div className="space-y-3">
            {[
              ["Total de OSs", machineServices.length],
              ["Concluídas", machineServices.filter(s => s.status === 'concluido').length],
              ["Em andamento", machineServices.filter(s => s.status !== 'concluido').length],
              ["Custo / Hora", formatCurrency(machine.hour_cost)],
              ["Receita / Hora", totalHours > 0 ? formatCurrency(totalRevenue / totalHours) : "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{k}:</span>
                <span className="font-bold text-sm">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financing Info */}
      {machine.financing && (
        <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col gap-5 mt-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5" /> Informações de Financiamento
            </h4>
            <Badge variant="outline" className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 border-none 
              ${machine.financing.installmentsPaid >= machine.financing.installmentsTotal ? 'bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))]' : 'bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))]'}`}>
              {machine.financing.installmentsPaid >= machine.financing.installmentsTotal ? "Quitado" : "Em Andamento"}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Valor Total</span>
                <p className="font-bold text-lg">{formatCurrency(machine.financing.totalAmount)}</p>
             </div>
             <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Valor da Parcela</span>
                <p className="font-bold text-lg">{formatCurrency(machine.financing.monthlyValue)} <span className="text-sm font-medium text-muted-foreground">/mês</span></p>
             </div>
             <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Previsão de Quitação</span>
                <p className="font-bold text-lg">{new Date(machine.financing.endDate).toLocaleDateString('pt-BR')}</p>
             </div>
          </div>
          
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-muted-foreground">Progresso do Pagamento</span>
              <span className="text-primary">{machine.financing.installmentsPaid} de {machine.financing.installmentsTotal} parcelas</span>
            </div>
            <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-primary rounded-full transition-all duration-1000" 
                 style={{ width: `${(machine.financing.installmentsPaid / machine.financing.installmentsTotal) * 100}%` }}
               />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>Pago: {formatCurrency(machine.financing.paidAmount)}</span>
              <span>Restante: {formatCurrency(machine.financing.totalAmount - machine.financing.paidAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Services History */}
      {machineServices.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
            <CalendarDays className="w-3 h-3" /> Histórico de Serviços
          </h4>
          <Card className="rounded-2xl border border-border bg-card overflow-hidden shadow-none">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {machineServices.slice(0, 10).map(s => (
                  <div key={s.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="font-bold text-sm text-primary">{s.id}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.client} · {new Date(s.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(s.value || 0)}</p>
                      <Badge variant="outline" className={`text-[9px] font-bold mt-1 ${s.status === 'concluido' ? 'text-[hsl(var(--success-text))] bg-[hsl(var(--success-subtle))]' : 'text-[hsl(var(--warning-text))] bg-[hsl(var(--warning-subtle))]'}`}>
                        {s.status === 'concluido' ? 'Concluído' : 'Em andamento'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
    </div>
  );
}
