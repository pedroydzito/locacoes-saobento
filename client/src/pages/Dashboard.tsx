import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { kpis, revenueData, machineUsageData, mockServices } from "@/lib/mock-data";
import { Wheat, DollarSign, Clock, Package, AlertTriangle, ArrowUpRight, ArrowDownRight, LayoutDashboard, Fuel } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const statCards = [
    { title: "Faturamento Bruto", value: formatCurrency(kpis.revenue), icon: DollarSign, trend: "+12%", trendUp: true, color: "var(--success)", sub: "Este mês" },
    { title: "Horas Máquina", value: `${kpis.hours}h`, icon: Clock, trend: "+5%", trendUp: true, color: "var(--primary)", sub: "Em operação" },
    { title: "Diesel Consumido", value: `${kpis.diesel}L`, icon: Fuel, trend: "-2%", trendUp: false, color: "var(--primary)", sub: "Média 15L/h" },
    { title: "Estoque Colheita", value: "12.4K", icon: Wheat, trend: "+18%", trendUp: true, color: "var(--primary)", sub: "Sacas (Soja)" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Visão Operacional</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Locações São Bento</p>
        </div>
      </div>

      {/* KPI Cards (Mobile: scroll horizontal, Desktop: grid) */}
      <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 snap-x snap-mandatory hide-scrollbar">
        {statCards.map((stat, i) => (
          <Card key={i} className="min-w-[260px] sm:min-w-0 snap-center shrink-0 border-border rounded-2xl">
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl`} style={{ backgroundColor: `hsl(${stat.color} / 0.1)` }}>
                  <stat.icon className="w-5 h-5" style={{ color: `hsl(${stat.color})` }} />
                </div>
                <div className={`flex items-center text-xs font-bold ${stat.trendUp ? 'text-[hsl(var(--success-text))]' : 'text-destructive'}`}>
                  {stat.trendUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                  {stat.trend}
                </div>
              </div>
              <div>
                  <p className="text-2xl font-bold tracking-tight" style={stat.title === "Faturamento Bruto" ? { color: `hsl(${stat.color})` } : {}}>{stat.value}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm font-bold text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Principal */}
        <Card className="lg:col-span-2 border-border rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold font-display">Desempenho Financeiro</h2>
            <p className="text-sm text-muted-foreground">Receita x Lucro por Mês</p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontFamily: 'var(--font-sans)'}} dy={10} />
                <YAxis width={0} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontFamily: 'var(--font-sans)', textAnchor: 'start'}} axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.1)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="revenue" name="Receita" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="profit" name="Lucro" stroke="hsl(var(--success))" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Alertas e Status (Mobile-first look) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-display px-1">Alertas Ativos</h2>
          
          <div className="bg-[hsl(var(--warning-subtle))] border border-[hsl(var(--warning)/0.2)] rounded-2xl p-4 flex gap-3 items-start touch-card">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--warning)/0.15)] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-[hsl(var(--warning-text))]" />
            </div>
            <div>
              <p className="font-bold text-[hsl(var(--warning-text))] text-sm">Manutenção Urgente</p>
              <p className="text-xs text-[hsl(var(--warning-text))/80] mt-0.5 font-medium leading-relaxed">
                Trator 7D1 reportou temperatura alta no óleo hidráulico. Parada recomendada.
              </p>
            </div>
          </div>

          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex gap-3 items-start touch-card">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="font-bold text-destructive text-sm">Estoque Baixo</p>
              <p className="text-xs text-destructive/80 mt-0.5 font-medium leading-relaxed">
                Nível de diesel no tanque Pátio Central abaixo de 15%. Necessário reabastecer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
