import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockMachines } from "@/lib/mock-data";
import { Search, Plus, MoreHorizontal } from "lucide-react";

export default function Machines() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Frota e Máquinas</h1>
          <p className="text-muted-foreground mt-1">Controle de equipamentos, custos e rentabilidade.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="shadow-sm hover:shadow-md transition-all active:scale-95">
            <Plus className="w-4 h-4 mr-2" />
            Nova Máquina
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar máquina..." 
              className="pl-9 border-border/50 bg-white"
            />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border/50 bg-muted/10 text-muted-foreground">
                  <th className="p-4 font-medium">Equipamento</th>
                  <th className="p-4 font-medium">Tipo</th>
                  <th className="p-4 font-medium text-right">Custo / Hora</th>
                  <th className="p-4 font-medium text-right">Consumo Diesel (L/h)</th>
                  <th className="p-4 font-medium text-right">Horas Trabalhadas</th>
                  <th className="p-4 font-medium text-right">Lucro Gerado</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {mockMachines.map((machine) => (
                  <tr key={machine.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-4 font-medium">{machine.name}</td>
                    <td className="p-4 text-muted-foreground">{machine.type}</td>
                    <td className="p-4 text-right">{formatCurrency(machine.hour_cost)}</td>
                    <td className="p-4 text-right text-muted-foreground">{machine.diesel_consumption}L</td>
                    <td className="p-4 text-right font-medium">{machine.hours_worked}h</td>
                    <td className="p-4 text-right font-medium text-emerald-600">{formatCurrency(machine.profit_generated)}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}