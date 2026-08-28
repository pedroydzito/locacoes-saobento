import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ComposedChart, Line, Legend
} from "recharts";
import { getMachinePerformanceByMonth } from "@/lib/mock-data";
import { ChevronLeft, ChevronRight, Activity, Fuel, Clock } from "lucide-react";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const COLORS = [
  "hsl(var(--primary))",
  "hsl(142, 70%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(221, 83%, 53%)",
  "hsl(280, 65%, 60%)",
  "hsl(0, 72%, 51%)",
  "hsl(175, 70%, 41%)",
  "hsl(45, 93%, 47%)",
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-card border border-border rounded-2xl shadow-lg p-4 min-w-[200px]">
      <p className="font-bold text-sm text-foreground mb-2">{label}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs text-muted-foreground">Horas Trabalhadas</span>
          <span className="font-bold text-xs text-primary">{data.hours}h</span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs text-muted-foreground">Diesel Consumido</span>
          <span className="font-bold text-xs text-amber-500">{data.diesel}L</span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs text-muted-foreground">Média de Consumo</span>
          <span className="font-bold text-xs text-orange-500">{data.avgDiesel} L/h</span>
        </div>
        {data.serviceCount > 0 && (
          <div className="flex justify-between items-center gap-4">
            <span className="text-xs text-muted-foreground">Serviços</span>
            <span className="font-bold text-xs">{data.serviceCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);

  const targetDate = useMemo(() => {
    return new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  }, [monthOffset]);

  const targetMonth = targetDate.getMonth();
  const targetYear = targetDate.getFullYear();

  const performanceData = useMemo(() => {
    return getMachinePerformanceByMonth(targetMonth, targetYear);
  }, [targetMonth, targetYear]);

  const previousDate = useMemo(() => {
    return new Date(targetYear, targetMonth - 1, 1);
  }, [targetMonth, targetYear]);

  const previousData = useMemo(() => {
    return getMachinePerformanceByMonth(previousDate.getMonth(), previousDate.getFullYear());
  }, [previousDate]);

  const totals = useMemo(() => ({
    hours: performanceData.reduce((a, b) => a + b.hours, 0),
    diesel: performanceData.reduce((a, b) => a + b.diesel, 0),
    machines: performanceData.length,
  }), [performanceData]);

  const avgDieselOverall = totals.hours > 0 ? totals.diesel / totals.hours : 0;

  const isCurrent = monthOffset === 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary hidden sm:block" />
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
              Desempenho de Máquinas
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">São Bento Locações</p>
            {isCurrent && (
              <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                Mês Atual
              </Badge>
            )}
          </div>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-3 bg-muted/30 rounded-2xl p-1.5 border border-border">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl hover:bg-background"
            onClick={() => setMonthOffset(p => p - 1)}
            disabled={monthOffset <= -12}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center min-w-[130px]">
            <p className="font-bold text-sm">{MONTHS[targetMonth]}</p>
            <p className="text-[10px] text-muted-foreground font-medium">{targetYear}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl hover:bg-background"
            onClick={() => setMonthOffset(p => p + 1)}
            disabled={monthOffset >= 0}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Activity, label: "Máquinas Ativas", value: `${totals.machines}`, sub: "com registro no mês", color: "primary" },
          { icon: Clock, label: "Total de Horas", value: `${totals.hours.toFixed(1)}h`, sub: "horas trabalhadas", color: "primary" },
          { icon: Fuel, label: "Diesel Consumido", value: `${totals.diesel}L`, sub: `Média ${avgDieselOverall.toFixed(1)} L/h`, color: "amber" },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <Card key={label} className="border-border rounded-2xl">
            <div className="p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                color === "primary" ? "bg-primary/10" : color === "amber" ? "bg-amber-500/10" : "bg-emerald-500/10"
              }`}>
                <Icon className={`w-4 h-4 ${
                  color === "primary" ? "text-primary" : color === "amber" ? "text-amber-500" : "text-emerald-500"
                }`} />
              </div>
              <p className="text-xl font-bold tracking-tight">{value}</p>
              <p className="text-xs font-bold text-muted-foreground mt-0.5">{label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Chart: Horas por Máquina */}
      {performanceData.length > 0 ? (
        <Card className="border-border rounded-2xl p-5 sm:p-6">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold font-display">Horas Trabalhadas por Máquina</h2>
              <p className="text-sm text-muted-foreground">{MONTHS[targetMonth]} {targetYear}</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-primary" />
                <span className="text-muted-foreground font-medium">Horas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-amber-400" />
                <span className="text-muted-foreground font-medium">Média Diesel (L/h)</span>
              </div>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={performanceData}
                margin={{ top: 5, right: 20, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="shortName"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontFamily: 'var(--font-sans)' }}
                  angle={-35}
                  textAnchor="end"
                  dy={10}
                  interval={0}
                />
                <YAxis
                  yAxisId="hours"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontFamily: 'var(--font-sans)' }}
                  tickFormatter={(v) => `${v}h`}
                  width={45}
                />
                <YAxis
                  yAxisId="diesel"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontFamily: 'var(--font-sans)' }}
                  tickFormatter={(v) => `${v}L/h`}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar yAxisId="hours" dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {performanceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.9} />
                  ))}
                </Bar>
                <Line
                  yAxisId="diesel"
                  type="monotone"
                  dataKey="avgDiesel"
                  stroke="hsl(38, 92%, 50%)"
                  strokeWidth={2.5}
                  dot={{ fill: "hsl(38, 92%, 50%)", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "hsl(38, 92%, 50%)" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : (
        <Card className="border-border rounded-2xl p-12 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
            <Activity className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <p className="font-bold text-foreground">Nenhum registro para este mês</p>
          <p className="text-sm text-muted-foreground">
            {MONTHS[targetMonth]} {targetYear} não possui serviços registrados.
            <br />Use as setas para navegar para outros meses.
          </p>
          <Button variant="outline" className="mt-2 rounded-xl" onClick={() => setMonthOffset(0)}>
            Ir para Mês Atual
          </Button>
        </Card>
      )}

      {/* Per-Machine Detail Cards */}
      {performanceData.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
            <Fuel className="w-3 h-3" /> Consumo de Diesel por Máquina
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {performanceData.map((m, idx) => {
              const prev = previousData.find(p => p.name === m.name);
              const hoursDelta = prev && prev.hours > 0 ? ((m.hours - prev.hours) / prev.hours) * 100 : null;
              const dieselDelta = prev && prev.diesel > 0 ? ((m.diesel - prev.diesel) / prev.diesel) * 100 : null;
              return (
              <div
                key={m.name}
                className="p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: COLORS[idx % COLORS.length] }}
                    />
                    <p className="font-bold text-sm text-foreground truncate max-w-[130px]">{m.name}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest bg-muted/30">
                    {m.serviceCount} OS
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Horas</p>
                    <p className="font-bold text-sm text-primary mt-0.5">{m.hours}h</p>
                    {hoursDelta !== null && (
                      <p className={`text-[10px] font-bold mt-0.5 ${hoursDelta >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                        {hoursDelta >= 0 ? "+" : ""}{hoursDelta.toFixed(0)}% vs mês ant.
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Diesel</p>
                    <p className="font-bold text-sm text-amber-500 mt-0.5">{m.diesel}L</p>
                    {dieselDelta !== null && (
                      <p className={`text-[10px] font-bold mt-0.5 ${dieselDelta >= 0 ? "text-amber-600" : "text-emerald-600"}`}>
                        {dieselDelta >= 0 ? "+" : ""}{dieselDelta.toFixed(0)}% vs mês ant.
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Média</p>
                    <p className="font-bold text-sm text-orange-500 mt-0.5">{m.avgDiesel} L/h</p>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
