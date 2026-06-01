import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { mockTransactions } from "@/lib/mock-data";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface CostManagerProps {
  service: any;
  onUpdateService: (updated: any) => void;
}

export function CostManager({ service, onUpdateService }: CostManagerProps) {
  const [costName, setCostName] = useState("");
  const [costValue, setCostValue] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCostId, setDeletingCostId] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const currentCosts = service.additionalCosts || [];

  const handleAddCost = () => {
    if (!costName || !costValue) return;
    
    const newValue = parseFloat(costValue);
    
    const newCost = {
      id: `cst-${Date.now()}`,
      name: costName,
      value: newValue,
      createdAt: new Date().toISOString(),
      createdBy: localStorage.getItem("userRole") === "admin" ? "admin@saobento.com" : "operador@saobento.com"
    };

    const updatedService = {
      ...service,
      additionalCosts: [...currentCosts, newCost]
    };

    onUpdateService(updatedService);
    
    // Automatically add as outgoing transaction in Finance
    mockTransactions.push({
      id: `tx-cst-${Date.now()}`,
      type: "saida",
      amount: newValue,
      date: new Date().toISOString().split('T')[0],
      description: `Custo: ${costName} (OS ${service.id})`,
      account: "Dinheiro",
      category: "Custos Operacionais",
      supplier: undefined,
      dueDate: undefined,
      allocation: undefined,
      createdAt: newCost.createdAt,
      createdBy: newCost.createdBy,
      relatedCostId: newCost.id,
      relatedServiceId: service.id
    });

    setCostName("");
    setCostValue("");
  };

  const handleRemoveCost = (costId: string) => {
    setDeletingCostId(costId);
    setIsDeleteDialogOpen(true);
  };

  const confirmRemoveCost = () => {
    if (!deletingCostId) return;
    onUpdateService({
      ...service,
      additionalCosts: currentCosts.filter((c: any) => c.id !== deletingCostId)
    });
    
    const txIndex = mockTransactions.findIndex(tx => tx.relatedCostId === deletingCostId);
    if (txIndex !== -1) {
      mockTransactions.splice(txIndex, 1);
    }
    setDeletingCostId(null);
  };

  const totalCosts = currentCosts.reduce((acc: number, curr: any) => acc + curr.value, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 pb-4 mb-4 border-b border-border/50">
        <div className="flex items-end gap-2">
          <div className="space-y-2 flex-1">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Nome do Custo</Label>
            <Input value={costName} onChange={e => setCostName(e.target.value)} placeholder="Ex: Peça Extra" className="h-10 rounded-xl" />
          </div>
          <div className="space-y-2 flex-1 relative">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Valor (R$)</Label>
            <Input type="number" value={costValue} onChange={e => setCostValue(e.target.value)} placeholder="0,00" className="h-10 rounded-xl font-mono" />
          </div>
          <Button onClick={handleAddCost} className="h-10 px-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
        {currentCosts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum custo adicionado.</p>
        ) : (
          currentCosts.map((cost: any) => (
            <div key={cost.id} className="flex items-center justify-between p-3 border border-border rounded-xl bg-card ">
              <span className="font-medium text-sm text-foreground">{cost.name}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-destructive font-bold">-{formatCurrency(cost.value)}</span>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveCost(cost.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-border/50 flex justify-between items-center text-sm">
        <span className="font-bold uppercase tracking-wide text-muted-foreground">Total de Custos</span>
        <span className="font-mono text-destructive font-bold text-xl">{formatCurrency(totalCosts)}</span>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmRemoveCost}
        title="Remover custo"
        description="Tem certeza que deseja remover este custo? O lançamento financeiro vinculado também será removido."
        confirmLabel="Remover"
      />
    </div>
  );
}
