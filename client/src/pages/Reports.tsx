import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { mockMachines, mockServices, machineUsageData, mockTransactions, kpis } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, TrendingUp, Users, Droplets, Target, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState } from "react";

export default function Reports() {
  const [machineFilter, setMachineFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("2023");

  const performanceData = mockMachines.map(m => {
    const services = mockServices.filter(s => s.machine === m.name);
    const hours = services.reduce((acc, s) => acc + (s.hours || 0), 0);
    const profit = services.reduce((acc, s) => acc + (s.profit || 0), 0);
    return {
      name: m.name,
      hours: Number(hours.toFixed(1)),
      profit: Math.max(0, profit)
    };
  }).filter(d => machineFilter === "all" || d.name === machineFilter)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 6);

  // Group transactions by month for Cash Flow
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const cashFlowData = months.map((month, index) => {
    const monthTransactions = mockTransactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === index && date.getFullYear() === parseInt(yearFilter);
    });

    const revenue = monthTransactions
      .filter(t => t.type === 'entrada')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const expense = monthTransactions
      .filter(t => t.type === 'saida')
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      name: month,
      revenue,
      expense,
      profit: revenue - expense
    };
  }).filter(d => d.revenue > 0 || d.expense > 0 || months.indexOf(d.name) <= new Date().getMonth());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const reportsList = [
    { title: "Rentabilidade Frota", value: formatCurrency(kpis.profit), desc: "Lucro total acumulado", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { title: "Receita Serviços", value: formatCurrency(kpis.revenue), desc: "Faturamento bruto total", icon: Target, color: "text-[hsl(var(--success-text))]", bg: "bg-[hsl(var(--success-subtle))]" },
    { title: "Horas Máquina", value: `${kpis.hours}h`, desc: "Total de horas operadas", icon: Users, color: "text-[hsl(var(--info-text))]", bg: "bg-[hsl(var(--info-subtle))]" },
    { title: "Consumo Diesel", value: `${kpis.diesel}L`, desc: "Total de litros utilizados", icon: Droplets, color: "text-[hsl(var(--warning-text))]", bg: "bg-[hsl(var(--warning-subtle))]" },
    { title: "Faturamento Mensal", value: formatCurrency(cashFlowData.reduce((acc, d) => acc + d.revenue, 0)), desc: "Soma das receitas do período", icon: FileText, color: "text-destructive", bg: "bg-destructive/10" },
  ];

  const pieData = [
    { name: 'Custo Máquina', value: 45 },
    { name: 'Custo Operador', value: 25 },
    { name: 'Diesel', value: 30 },
  ];
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--info))'];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-primary hidden sm:block" />
            <h1 className="text-3xl font-bold tracking-tight font-display">Central de Relatórios</h1>
          </div>
          <p className="text-muted-foreground mt-1">Análises detalhadas de performance e custos.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-10 rounded-xl w-[110px] border-border bg-white text-sm font-bold">
              <Calendar className="w-4 h-4 mr-2 text-primary" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-border bg-white transition-all rounded-xl h-10 px-5 text-primary hover:text-primary hover:bg-primary/5">
            <Download className="w-4 h-4 mr-2" />
            Exportar Todos (PDF)
          </Button>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 snap-x snap-mandatory hide-scrollbar">
        {reportsList.map((report, i) => (
          <Card key={i} className="min-w-[260px] sm:min-w-0 snap-center shrink-0 border-border rounded-2xl  hover:bg-muted/30 transition-all cursor-pointer group">
            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
              <div className={`p-3 rounded-xl ${report.bg} transition-transform group-hover:scale-110`}>
                <report.icon className={`w-6 h-6 ${report.color}`} />
              </div>
              <div className="flex flex-col items-center">
                <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground leading-none mb-1.5 focus-visible:ring-primary/20">{report.title}</h3>
                <p className="text-lg font-bold text-foreground leading-none">{report.value}</p>
                <p className="text-[10px] text-muted-foreground mt-2 leading-snug">{report.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <Card className="border-border rounded-2xl ">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-display">Rentabilidade da Frota</CardTitle>
                <CardDescription>Horas vs Lucro (Top 5)</CardDescription>
              </div>
              <Select value={machineFilter} onValueChange={setMachineFilter}>
                <SelectTrigger className="h-9 rounded-xl w-full sm:w-[180px] border-border bg-card text-xs">
                  <SelectValue placeholder="Todas as Máquinas" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Todas as Máquinas</SelectItem>
                  {mockMachines.map(m => (
                    <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'var(--font-sans)'}} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'var(--font-sans)', fontWeight: 600}} width={120} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontFamily: 'var(--font-sans)', fontSize: '12px' }}
                    formatter={(value: number, name: string) => {
                      if (name.includes("(R$)") || name.includes("Lucro")) {
                        return [formatCurrency(value), name];
                      }
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="profit" name="Lucro (R$)" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="hours" name="Horas Trab." fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--success))]" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lucro (R$)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Horas Trabalhadas</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border rounded-2xl overflow-hidden bg-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-display">Fluxo de Caixa Mensal</CardTitle>
                <CardDescription>Receitas vs Despesas ({yearFilter})</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Receita</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Despesa</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 600}} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}} 
                    tickFormatter={(value) => `R$${Math.round(value/1000)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: 'none', fontFamily: 'var(--font-sans)', fontSize: '12px' }}
                    formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                  />
                  <Area type="monotone" dataKey="revenue" name="Receita" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="expense" name="Despesa" stroke="hsl(var(--destructive))" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}