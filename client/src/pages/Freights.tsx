import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockFreights } from "@/lib/mock-data";
import { Search, Plus, MoreHorizontal, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Freights() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'concluido':
        return <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-200 shadow-none">Concluído</Badge>;
      case 'em_andamento':
        return <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border-blue-200 shadow-none">Em Andamento</Badge>;
      case 'planejado':
        return <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-200 shadow-none">Planejado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fretes</h1>
          <p className="text-muted-foreground mt-1">Controle de transporte e movimentação de máquinas.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="shadow-sm hover:shadow-md transition-all active:scale-95">
            <Plus className="w-4 h-4 mr-2" />
            Novo Frete
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar por máquina, origem ou destino..." 
              className="pl-9 border-border/50 bg-white"
            />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border/50 bg-muted/10 text-muted-foreground">
                  <th className="p-4 font-medium">ID</th>
                  <th className="p-4 font-medium">Data</th>
                  <th className="p-4 font-medium">Máquina</th>
                  <th className="p-4 font-medium">Rota (Origem → Destino)</th>
                  <th className="p-4 font-medium">Motorista</th>
                  <th className="p-4 font-medium text-right">Valor</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {mockFreights.map((freight) => (
                  <tr key={freight.id} className="hover:bg-muted/30 transition-colors group cursor-pointer">
                    <td className="p-4 font-medium text-primary">{freight.id}</td>
                    <td className="p-4 text-muted-foreground">{new Date(freight.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4 font-medium">{freight.machine}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{freight.origin}</span>
                        <MapPin className="w-3 h-3 text-primary/50" />
                        <span>{freight.destination}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{freight.driver}</td>
                    <td className="p-4 text-right font-medium">{formatCurrency(freight.value)}</td>
                    <td className="p-4 text-center">
                      {getStatusBadge(freight.status)}
                    </td>
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