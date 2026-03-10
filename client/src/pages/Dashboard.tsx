import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { kpis, revenueData, machineUsageData, mockServices } from "@/lib/mock-data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { AlertCircle, DollarSign, Clock, TrendingUp, Droplet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Dashboard() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const statCards = [
    { title: "Faturamento (Mês)", value: formatCurrency(kpis.revenue), icon: DollarSign, trend: "+12.5%", trendUp: true },
    { title: "Lucro Estimado", value: formatCurrency(kpis.profit), icon: TrendingUp, trend: "+8.2%", trendUp: true },
    { title: "Horas Trabalhadas", value: `${kpis.hours}h`, icon: Clock, trend: "+5.1%", trendUp: true },
    { title: "Diesel Consumido", value: `${kpis.diesel}L`, icon: Droplet, trend: "-2.4%", trendUp: false },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
        <p className="text-muted-foreground mt-1">Acompanhe os principais indicadores da frota.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className="p-2 bg-primary/5 rounded-lg">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs mt-1 font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.trend} em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Receita vs Lucro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} tickFormatter={(value) => `R$${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="revenue" name="Receita" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="profit" name="Lucro" stroke="hsl(142 71% 45%)" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Uso por Máquina (Horas)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={machineUsageData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} width={100} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))'}}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="hours" name="Horas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Serviços */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-border/50 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg">Serviços Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                      <th className="pb-3 font-medium">OS</th>
                      <th className="pb-3 font-medium">Cliente</th>
                      <th className="pb-3 font-medium">Máquina</th>
                      <th className="pb-3 font-medium">Operador</th>
                      <th className="pb-3 font-medium text-right">Valor</th>
                      <th className="pb-3 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockServices.slice(0, 5).map((service) => (
                      <tr key={service.id} className="border-b border-border/10 hover:bg-muted/50 transition-colors">
                        <td className="py-3 font-medium text-primary cursor-pointer">{service.id}</td>
                        <td className="py-3 font-medium">{service.client}</td>
                        <td className="py-3 text-muted-foreground">{service.machine}</td>
                        <td className="py-3 text-muted-foreground">{service.operator}</td>
                        <td className="py-3 font-medium text-right">{formatCurrency(service.value)}</td>
                        <td className="py-3 text-center">
                          <Badge variant={service.status === 'concluido' ? 'default' : 'secondary'} className={service.status === 'concluido' ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-200' : 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-200'}>
                            {service.status === 'concluido' ? 'Concluído' : 'Em andamento'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-border/50 shadow-sm h-full bg-muted/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                Alertas Operacionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/20 text-rose-700 cursor-pointer hover:bg-rose-500/20 transition-colors">
                <AlertCircle className="h-4 w-4" color="currentColor" />
                <AlertTitle className="text-sm font-semibold">Máquina Ociosa</AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  Trator 7D1 está parado há mais de 7 dias no pátio.
                </AlertDescription>
              </Alert>
              
              <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-700 cursor-pointer hover:bg-amber-500/20 transition-colors">
                <AlertCircle className="h-4 w-4" color="currentColor" />
                <AlertTitle className="text-sm font-semibold">Consumo Elevado</AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  Escavadeira 220 Nova registrou 25% mais diesel que a média.
                </AlertDescription>
              </Alert>

              <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-700 cursor-pointer hover:bg-blue-500/20 transition-colors">
                <AlertCircle className="h-4 w-4" color="currentColor" />
                <AlertTitle className="text-sm font-semibold">Manutenção Prevista</AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  Caminhão 2544 atingiu 10.000h. Agendar troca de óleo.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}