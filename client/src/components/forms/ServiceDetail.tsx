import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, DollarSign, Calendar, Clock, Pickaxe, User, Fuel, TrendingUp, TrendingDown, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceDetailProps {
  service: any;
  onManageCosts: (service: any) => void;
  onEdit: (service: any) => void;
}

export function ServiceDetail({ service, onManageCosts, onEdit }: ServiceDetailProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const costs = service.costs || { machine: 0, operator: 0, diesel: 0 };
  const totalCosts = (costs.machine || 0) + (costs.operator || 0) + (costs.diesel || 0);
  const profit = (service.value || 0) - totalCosts;
  const margin = service.value > 0 ? (profit / service.value) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Dynamic Header Actions */}
      <div className="flex items-center justify-between pb-2">
        <Badge variant="secondary" className="bg-muted text-muted-foreground border border-border text-[10px] uppercase font-bold tracking-widest px-3 py-1 shadow-none">
          Status: {service.status === 'concluido' ? 'Faturado/Concluído' : 'Em Andamento'}
        </Badge>
        <Button variant="outline" size="sm" onClick={() => onEdit(service)} className="rounded-xl h-9 border border-border transition-all hover:bg-primary/5 hover:text-primary shadow-none">
          <Edit className="w-4 h-4 mr-2" />
          Editar OS
        </Button>
      </div>

      {/* Header Info - Grid 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-2xl bg-muted/20 border border-border shadow-none">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Calendar className="w-3 h-3" /> Data
          </p>
          <p className="font-bold text-sm">{new Date(service.date).toLocaleDateString('pt-BR')}</p>
        </div>
        <div className="p-3 rounded-2xl bg-muted/20 border border-border shadow-none">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Pickaxe className="w-3 h-3" /> Tipo de Serviço
          </p>
          <p className="font-bold text-sm uppercase">{service.serviceType || '—'}</p>
        </div>
        <div className="p-3 rounded-2xl bg-muted/20 border border-border shadow-none">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Clock className="w-3 h-3" /> Horas
          </p>
          <p className="font-bold text-sm">{service.hora_inicial} - {service.hora_final} ({service.hours.toFixed(1)}h)</p>
        </div>
        <div className="p-3 rounded-2xl bg-muted/20 border border-border shadow-none">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Fuel className="w-3 h-3" /> Diesel
          </p>
          <p className="font-bold text-sm">{service.diesel} L</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-none">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <Pickaxe className="w-3.5 h-3.5" /> Equipamento e Equipe
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Máquina:</span>
              <span className="font-bold text-sm">{service.machine}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Operador:</span>
              <span className="font-bold text-sm">{service.operator}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cliente/Obra:</span>
              <span className="font-bold text-sm text-primary">{service.client}</span>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border border-border shadow-none ${profit >= 0 ? 'bg-success/5' : 'bg-destructive/5'}`}>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <TrendingUp className={`w-3.5 h-3.5 ${profit >= 0 ? 'text-success' : 'text-destructive'}`} /> Lucro
          </p>
          <div className="space-y-1">
            <p className={`text-2xl font-bold font-display ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(profit)}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-[10px] border border-border shadow-none ${profit >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                {margin.toFixed(1)}% de margem
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Detalhamento Financeiro</h4>
        <Card className="rounded-2xl border border-border bg-card overflow-hidden shadow-none">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <div className="p-4 flex justify-between items-center bg-muted/5 border-b border-border shadow-none">
                <div>
                  <span className="text-sm font-bold">Faturamento (Receita)</span>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Total faturado nesta OS</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-primary text-lg">{formatCurrency(service.value || 0)}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onManageCosts(service)} 
                    className="rounded-xl h-8 text-[10px] uppercase font-bold border border-border bg-white transition-all hover:bg-primary/5 hover:text-primary shadow-none"
                  >
                    <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                    Gerenciar Custos
                  </Button>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Custo de Máquina (Horas)</span>
                  <span className="font-medium text-destructive">{formatCurrency(costs.machine || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Custo de Operador</span>
                  <span className="font-medium text-destructive">{formatCurrency(costs.operator || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Custo de Combustível</span>
                  <span className="font-medium text-destructive">{formatCurrency(costs.diesel || 0)}</span>
                </div>
              </div>

              <div className="p-4 flex justify-between items-center bg-muted/30 border-t border-border shadow-none">
                <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Total de Custos</span>
                <span className="font-bold text-destructive">{formatCurrency(totalCosts)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
