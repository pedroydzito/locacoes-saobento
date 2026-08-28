import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getOperatorDailyHours } from "@/lib/mock-data";

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
  const [compareKey, setCompareKey] = useState("none");

  const compareOptions = useMemo(() => {
    return Array.from({ length: 11 }, (_, i) => {
      const d = new Date(year, month - (i + 1), 1);
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        month: d.getMonth(),
        year: d.getFullYear(),
      };
    });
  }, [month, year]);

  const currentDays = useMemo(
    () => getOperatorDailyHours(operatorName, month, year),
    [operatorName, month, year]
  );

  const compareMeta = compareOptions.find(o => o.key === compareKey);

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
        <Select value={compareKey} onValueChange={setCompareKey}>
          <SelectTrigger className="h-10 rounded-xl w-full sm:w-[200px] border-border bg-card text-sm">
            <SelectValue placeholder="Comparar com..." />
          </SelectTrigger>
          <SelectContent className="rounded-xl z-50">
            <SelectItem value="none" className="cursor-pointer">Sem comparativo</SelectItem>
            {compareOptions.map(opt => (
              <SelectItem key={opt.key} value={opt.key} className="cursor-pointer">{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
