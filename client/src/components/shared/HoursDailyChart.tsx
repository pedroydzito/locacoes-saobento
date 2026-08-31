import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getOperatorDailyHours } from "@/lib/mock-data";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function HoursTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-2xl shadow-lg p-3 min-w-[160px]">
      <p className="font-bold text-sm text-foreground mb-1.5">Dia {label}</p>
      <div className="space-y-1">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex justify-between items-center gap-4">
            <span className="text-xs text-muted-foreground">{entry.name}</span>
            <span className="font-bold text-xs" style={{ color: entry.color }}>{entry.value}h</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface HoursDailyChartProps {
  operatorName: string;
  month: number;
  year: number;
  compact?: boolean;
}

export function HoursDailyChart({ operatorName, month, year, compact }: HoursDailyChartProps) {
  const [compareOffset, setCompareOffset] = useState(0);

  useEffect(() => {
    setCompareOffset(0);
  }, [month, year]);

  const compareMeta = useMemo(() => {
    if (compareOffset >= 0) return null;
    const d = new Date(year, month + compareOffset, 1);
    return { month: d.getMonth(), year: d.getFullYear() };
  }, [compareOffset, month, year]);

  const currentDays = useMemo(
    () => getOperatorDailyHours(operatorName, month, year),
    [operatorName, month, year]
  );

  const compareDays = useMemo(() => {
    if (!compareMeta) return null;
    return getOperatorDailyHours(operatorName, compareMeta.month, compareMeta.year);
  }, [operatorName, compareMeta]);

  const chartData = useMemo(() => {
    return currentDays.map((d) => ({
      day: d.day,
      current: d.hours,
      compare: compareDays ? (compareDays.find(c => c.day === d.day)?.hours || 0) : undefined,
    }));
  }, [currentDays, compareDays]);

  const monthTotal = currentDays.reduce((a, b) => a + b.hours, 0);
  const compareTotal = compareDays ? compareDays.reduce((a, b) => a + b.hours, 0) : 0;
  const currentLabel = `${MONTHS[month].slice(0, 3)} ${year}`;
  const compareLabel = compareMeta ? `${MONTHS[compareMeta.month].slice(0, 3)} ${compareMeta.year}` : "";

  return (
    <Card className={`border-border rounded-2xl ${compact ? "p-4" : "p-5 sm:p-6"}`}>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold font-display">Horas por dia</h3>
          <p className="text-sm text-muted-foreground">
            {MONTHS[month]} {year} · {monthTotal.toFixed(1)}h no mês
            {compareMeta ? ` · ${compareLabel}: ${compareTotal.toFixed(1)}h` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-muted/30 rounded-2xl p-1.5 border border-border shrink-0 self-start sm:self-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl hover:bg-background"
            onClick={() => setCompareOffset(o => o - 1)}
            disabled={compareOffset <= -12}
            aria-label="Mês anterior para comparar"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center min-w-[128px] px-1">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Comparar</p>
            <p className="font-bold text-xs leading-tight">
              {compareMeta ? `${MONTHS[compareMeta.month]} ${compareMeta.year}` : "Sem comparativo"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl hover:bg-background"
            onClick={() => setCompareOffset(o => Math.min(0, o + 1))}
            disabled={compareOffset >= 0}
            aria-label="Próximo mês para comparar"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className={compact ? "h-[220px] w-full" : "h-[280px] w-full"}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "var(--font-sans)" }}
              interval={2}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "var(--font-sans)" }}
              tickFormatter={(v) => `${v}h`}
              width={40}
            />
            <Tooltip content={<HoursTooltip />} />
            {compareMeta && (
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value) => <span className="text-muted-foreground text-xs font-medium">{value}</span>}
              />
            )}
            <Bar dataKey="current" name={currentLabel} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={18} />
            {compareMeta && (
              <Bar dataKey="compare" name={compareLabel} fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} maxBarSize={18} fillOpacity={0.75} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
