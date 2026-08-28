import { useLocation, useRoute } from "wouter";
import { mockInventory, mockInventoryMovements, mockMachines } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft, Package, AlertTriangle, MapPin, Calendar } from "lucide-react";

export default function InventoryDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/estoque/:id");
  const itemId = params?.id;
  const item = mockInventory.find(i => i.id === itemId);

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground text-lg">Item não encontrado.</p>
        <Button variant="outline" onClick={() => setLocation("/estoque")} className="rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Estoque
        </Button>
      </div>
    );
  }

  const movements = mockInventoryMovements
    .filter(m => m.itemId === item.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const isLowStock = item.quantity < item.minQuantity;
  const allocatedByDestination = movements.reduce((acc, m) => {
    acc[m.destination] = (acc[m.destination] || 0) + m.quantity;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 pb-8">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <button onClick={() => setLocation("/estoque")} className="hover:text-primary transition-colors font-medium cursor-pointer">
          Estoque
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-bold">{item.name}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/estoque")}
            className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground sm:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight">{item.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5 font-mono">Cód. {item.code}</p>
          </div>
        </div>
        {isLowStock ? (
          <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 flex items-center gap-1 w-fit">
            <AlertTriangle className="w-3 h-3" />
            Estoque baixo
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-0">
            Estoque normal
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-muted/20 border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Quantidade atual</p>
          <p className={`font-bold text-lg ${isLowStock ? "text-destructive" : "text-foreground"}`}>{item.quantity} {item.unit}</p>
        </div>
        <div className="p-4 rounded-2xl bg-muted/20 border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Mínimo</p>
          <p className="font-bold text-lg">{item.minQuantity} {item.unit}</p>
        </div>
        <div className="p-4 rounded-2xl bg-muted/20 border border-border col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Alocado (histórico)</p>
          <p className="font-bold text-lg">{movements.reduce((a, m) => a + m.quantity, 0)} {item.unit}</p>
        </div>
      </div>

      {Object.keys(allocatedByDestination).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> Para onde foi alocado
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(allocatedByDestination).map(([dest, qty]) => {
              const machine = mockMachines.find(m => m.name === dest);
              return (
                <div key={dest} className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{dest}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">
                      {machine ? "Máquina" : "Destino"}
                    </p>
                  </div>
                  <p className="font-bold text-sm text-primary">{qty} {item.unit}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
          <Calendar className="w-3 h-3" /> Histórico de movimentações
        </h4>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {movements.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Nenhuma alocação registrada para este item.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {movements.map(m => (
                <div key={m.id} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-sm">{m.destination}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(m.date + "T12:00:00").toLocaleDateString("pt-BR")} · {m.source} · {m.reference}
                    </p>
                  </div>
                  <p className="font-bold text-sm text-primary shrink-0">-{m.quantity} {item.unit}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
