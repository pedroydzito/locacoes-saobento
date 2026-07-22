import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Truck, MapPin, Clock, CheckCircle2, ChevronRight, Play, Check } from "lucide-react";
import { mockFreights } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { ActionModal } from "@/components/ui/action-modal";

export default function DriverPortal() {
  const [, setLocation] = useLocation();
  const driverName = localStorage.getItem("driverName") || "Motorista";
  const [activeTab, setActiveTab] = useState<"ativos" | "historico">("ativos");
  const [selectedFreight, setSelectedFreight] = useState<any>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [kmInicial, setKmInicial] = useState("");
  const [kmFinal, setKmFinal] = useState("");
  const [notes, setNotes] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("driverName");
    setLocation("/login");
  };

  const driverFreights = mockFreights.filter(f => {
    // Match by driver name - check different possible name formats
    const storedName = driverName.toLowerCase();
    const freightDriver = (f.driver || "").toLowerCase();
    return freightDriver === storedName || freightDriver.includes(storedName.split(' ')[0]) || storedName.includes(freightDriver.split(' ')[0]);
  });

  const activeFreights = driverFreights.filter(f => f.status !== "concluido");
  const completedFreights = driverFreights.filter(f => f.status === "concluido");

  const totalKm = completedFreights.reduce((acc, f) => {
    if (f.km_inicial && f.km_final) return acc + (f.km_final - f.km_inicial);
    return acc;
  }, 0);

  const handleOpenUpdate = (freight: any) => {
    setSelectedFreight(freight);
    setKmInicial(freight.km_inicial ? String(freight.km_inicial) : "");
    setKmFinal(freight.km_final ? String(freight.km_final) : "");
    setNotes(freight.notes || "");
    setIsUpdateModalOpen(true);
  };

  const handleSaveFreight = (newStatus: "em_andamento" | "concluido") => {
    if (!selectedFreight) return;
    const idx = mockFreights.findIndex(f => f.id === selectedFreight.id);
    if (idx !== -1) {
      mockFreights[idx] = {
        ...mockFreights[idx],
        status: newStatus,
        km_inicial: kmInicial ? Number(kmInicial) : mockFreights[idx].km_inicial,
        km_final: kmFinal ? Number(kmFinal) : mockFreights[idx].km_final,
        notes: notes || mockFreights[idx].notes,
      };
    }
    setIsUpdateModalOpen(false);
    setSelectedFreight(null);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base font-display leading-tight">{driverName}</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Portal do Motorista</p>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-xl text-muted-foreground hover:text-destructive">
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-5">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-card border border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Truck className="w-3.5 h-3.5 text-primary" /> Fretes Ativos
            </p>
            <p className="text-xl font-bold font-mono">{activeFreights.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" /> KM Percorridos
            </p>
            <p className="text-xl font-bold font-mono text-emerald-600">{totalKm} km</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-muted/30 border border-border p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab("ativos")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === "ativos" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            Fretes Atribuídos ({activeFreights.length})
          </button>
          <button
            onClick={() => setActiveTab("historico")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === "historico" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            Histórico Concluído
          </button>
        </div>

        {/* Fretes List */}
        {activeTab === "ativos" ? (
          <div className="space-y-3">
            {activeFreights.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
                <Truck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">Nenhum frete ativo pendente.</p>
              </div>
            ) : (
              activeFreights.map(f => (
                <Card key={f.id} className="rounded-2xl border-border bg-card p-4 space-y-3 hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-primary">{f.id}</span>
                        <Badge variant="outline" className={`text-[9px] font-bold uppercase ${f.status === 'em_andamento' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                          {f.status === 'em_andamento' ? 'Em Viagem' : 'Planejado'}
                        </Badge>
                      </div>
                      <p className="font-bold text-sm text-foreground">{f.machine}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Cliente: {f.client}</p>
                    </div>
                    <span className="font-bold text-sm text-emerald-600">{formatCurrency(f.value)}</span>
                  </div>

                  <div className="bg-muted/30 p-2.5 rounded-xl border border-border/50 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-destructive shrink-0" />
                      <span>De: <strong>{f.origin}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Para: <strong>{f.destination}</strong></span>
                    </div>
                  </div>

                  <Button onClick={() => handleOpenUpdate(f)} className="w-full h-10 rounded-xl font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                    <Play className="w-3.5 h-3.5 mr-1.5" /> Atualizar Viagem / Odômetro
                  </Button>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {completedFreights.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">Nenhum frete concluído ainda.</p>
              </div>
            ) : (
              completedFreights.map(f => (
                <Card key={f.id} className="rounded-2xl border-border bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-primary">{f.id}</span>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] font-bold uppercase">
                      Concluído
                    </Badge>
                  </div>
                  <p className="font-bold text-sm">{f.machine}</p>
                  <p className="text-xs text-muted-foreground">{f.origin} ➔ {f.destination}</p>
                  {f.km_inicial && f.km_final && (
                    <p className="text-xs font-mono text-muted-foreground">
                      KM: {f.km_inicial} ➔ {f.km_final} ({f.km_final - f.km_inicial} km)
                    </p>
                  )}
                </Card>
              ))
            )}
          </div>
        )}
      </main>

      {/* Update Freight Modal */}
      <ActionModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={`Atualizar Frete ${selectedFreight?.id}`}
      >
        <div className="space-y-4 p-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">KM Inicial (Saída)</Label>
              <Input type="number" value={kmInicial} onChange={e => setKmInicial(e.target.value)} placeholder="Ex: 120500" className="h-11 rounded-xl font-mono" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">KM Final (Chegada)</Label>
              <Input type="number" value={kmFinal} onChange={e => setKmFinal(e.target.value)} placeholder="Ex: 120750" className="h-11 rounded-xl font-mono" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Observações do Motorista</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Condições da estrada, abastecimento, etc." className="h-11 rounded-xl" />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl h-11 text-xs" onClick={() => handleSaveFreight("em_andamento")}>
              <Play className="w-3.5 h-3.5 mr-1" /> Em Andamento
            </Button>
            <Button className="flex-1 rounded-xl h-11 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleSaveFreight("concluido")}>
              <Check className="w-3.5 h-3.5 mr-1" /> Finalizar Frete
            </Button>
          </div>
        </div>
      </ActionModal>
    </div>
  );
}
