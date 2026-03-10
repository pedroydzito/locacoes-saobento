import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockOperators } from "@/lib/mock-data";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Operators() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operadores</h1>
          <p className="text-muted-foreground mt-1">Gestão da equipe de operadores e horímetros.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="shadow-sm hover:shadow-md transition-all active:scale-95">
            <Plus className="w-4 h-4 mr-2" />
            Novo Operador
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar operador..." 
              className="pl-9 border-border/50 bg-white"
            />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border/50 bg-muted/10 text-muted-foreground">
                  <th className="p-4 font-medium">Nome</th>
                  <th className="p-4 font-medium">Máquina Associada</th>
                  <th className="p-4 font-medium text-right">Salário Base</th>
                  <th className="p-4 font-medium text-right">Horas no Mês</th>
                  <th className="p-4 font-medium text-center">Serviços Feitos</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {mockOperators.map((op) => (
                  <tr key={op.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-4 font-medium">{op.name}</td>
                    <td className="p-4">
                      <Badge variant="secondary" className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/20">
                        {op.machine_assigned}
                      </Badge>
                    </td>
                    <td className="p-4 text-right text-muted-foreground">{formatCurrency(op.salary)}</td>
                    <td className="p-4 text-right font-medium">{op.hours_worked}h</td>
                    <td className="p-4 text-center">{op.services_done}</td>
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