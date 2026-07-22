import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Wrench, Package, Plus, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { mockMachines, mockMaintenanceRecords, mockInventory } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { ActionModal } from "@/components/ui/action-modal";
import { MaintenanceForm } from "@/components/forms/MaintenanceForm";

export default function MechanicPortal() {
  const [, setLocation] = useLocation();
  const mechanicName = localStorage.getItem("mechanicName") || "Mecânico";
  const [activeTab, setActiveTab] = useState<"manutencoes" | "estoque">("manutencoes");
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("mechanicName");
    setLocation("/login");
  };

  const myRecords = mockMaintenanceRecords.filter(m => {
    // Match by mechanic name - case-insensitive partial match
    const storedName = mechanicName.toLowerCase();
    const recordMechanic = (m.mechanicName || "").toLowerCase();
    return recordMechanic === storedName || recordMechanic.includes(storedName.split(' ')[0]) || storedName.includes(recordMechanic.split(' ')[0]);
  });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20" key={refreshKey}>
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base font-display leading-tight">{mechanicName}</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Portal da Oficina / Mecânico</p>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-xl text-muted-foreground hover:text-destructive">
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-5">
        {/* Quick Action Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm">Registrar Manutenção</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Informe manutenções e peças aplicadas nas máquinas</p>
          </div>
          <Button onClick={() => setIsMaintenanceModalOpen(true)} className="rounded-xl font-bold text-xs shrink-0 ml-3">
            <Plus className="w-4 h-4 mr-1" /> Nova OS
          </Button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-muted/30 border border-border p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab("manutencoes")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === "manutencoes" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            Manutenções ({myRecords.length})
          </button>
          <button
            onClick={() => setActiveTab("estoque")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === "estoque" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            Consulta Estoque ({mockInventory.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "manutencoes" ? (
          <div className="space-y-3">
            {myRecords.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
                <Wrench className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">Nenhuma manutenção registrada por você.</p>
              </div>
            ) : (
              myRecords.map(m => {
                const machineObj = mockMachines.find(mac => mac.id === m.machineId);
                return (
                  <Card key={m.id} className="rounded-2xl border-border bg-card p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-primary">{machineObj?.name || 'Máquina'}</span>
                          <Badge variant="outline" className="text-[9px] font-bold uppercase bg-amber-500/10 text-amber-600 border-amber-500/20">
                            {m.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(m.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <span className="font-bold text-sm text-destructive">{formatCurrency(m.totalCost)}</span>
                    </div>

                    <p className="text-xs text-foreground leading-relaxed">{m.description}</p>

                    {m.partsUsed.length > 0 && (
                      <div className="pt-2 border-t border-border/40 space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Peças Usadas:</p>
                        {m.partsUsed.map((p, i) => (
                          <div key={i} className="flex justify-between text-xs text-muted-foreground">
                            <span>{p.quantity}x {p.name} ({p.code})</span>
                            <span className="font-mono">{formatCurrency(p.quantity * p.unitPrice)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {mockInventory.map((item: any) => (
              <Card key={item.id} className="rounded-2xl border-border bg-card p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">Cód: {item.code || item.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-primary">{item.quantity} {item.unit || 'un'}</span>
                  <p className="text-[10px] text-muted-foreground">{formatCurrency(item.unitCost || 0)}/un</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Maintenance Modal */}
      <ActionModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        title="Registrar Manutenção"
      >
        <MaintenanceForm
          onSave={() => {
            setIsMaintenanceModalOpen(false);
            setRefreshKey(k => k + 1);
          }}
          onCancel={() => setIsMaintenanceModalOpen(false)}
        />
      </ActionModal>
    </div>
  );
}
