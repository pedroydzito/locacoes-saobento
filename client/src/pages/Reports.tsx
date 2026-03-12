import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { machineUsageData } from "@/lib/mock-data";
import { Download, FileText, TrendingUp, Users, Droplets, Target } from "lucide-react";

export default function Reports() {
  const reportsList = [
    { title: "Rentabilidade por Máquina", desc: "Análise de lucro e custos por equipamento", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Rentabilidade por Cliente", desc: "Ranking de faturamento e margem por obra", icon: Target, color: "text-[hsl(var(--success-text))]", bg: "bg-[hsl(var(--success-subtle))]" },
    { title: "Produtividade Operadores", desc: "Horas trabalhadas e eficiência da equipe", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Consumo de Diesel", desc: "Média de consumo (L/h) da frota", icon: Droplets, color: "text-[hsl(var(--warning-text))]", bg: "bg-[hsl(var(--warning-subtle))]" },
    { title: "Faturamento Mensal", desc: "Histórico de receitas e despesas", icon: FileText, color: "text-rose-600", bg: "bg-rose-50" },
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display">Central de Relatórios</h1>
          <p className="text-muted-foreground mt-1">Análises detalhadas de performance e custos.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-border shadow-sm transition-all rounded-xl h-10 px-5">
            <Download className="w-4 h-4 mr-2" />
            Exportar Todos (PDF)
          </Button>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 snap-x snap-mandatory hide-scrollbar">
        {reportsList.map((report, i) => (
          <Card key={i} className="min-w-[260px] sm:min-w-0 snap-center shrink-0 border-border rounded-2xl shadow-sm hover:bg-muted/30 transition-all cursor-pointer group">
            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
              <div className={`p-3 rounded-xl ${report.bg} transition-transform group-hover:scale-110`}>
                <report.icon className={`w-6 h-6 ${report.color}`} />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight text-foreground">{report.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{report.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <Card className="border-border rounded-2xl shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-display">Rentabilidade da Frota</CardTitle>
                <CardDescription>Lucro gerado por máquina (Top 5)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={machineUsageData} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontFamily: 'var(--font-mono)'}} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 600}} width={120} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontFamily: 'var(--font-sans)' }}
                  />
                  <Bar dataKey="hours" name="Lucro (R$)" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border rounded-2xl shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-display">Distribuição de Custos</CardTitle>
                <CardDescription>Composição média de custo por serviço</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontFamily: 'var(--font-sans)', fontWeight: 600 }}
                    formatter={(value) => `${value}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm font-bold text-foreground">{entry.name} ({entry.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}