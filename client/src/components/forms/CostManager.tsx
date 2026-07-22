import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { mockTransactions } from "@/lib/mock-data";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface CostManagerProps {
  service: any;
  onUpdateService: (updated: any) => void;
}

export function CostManager({ service, onUpdateService }: CostManagerProps) {
  const [costName, setCostName] = useState("");
  const [costValue, setCostValue] = useState("");
  const [entryType, setEntryType] = useState<"saida" | "entrada">("saida");
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
      type: entryType,
      createdAt: new Date().toISOString(),
      createdBy: localStorage.getItem("userRole") === "admin" ? "admin@saobento.com" : "operador@saobento.com"
    };

    const updatedService = {
      ...service,
      additionalCosts: [...currentCosts, newCost]
    };

    onUpdateService(updatedService);
    
    // Add as transaction in Finance
    mockTransactions.push({
      id: `tx-cst-${Date.now()}`,
      type: entryType,
      amount: newValue,
      date: new Date().toISOString().split('T')[0],
      description: `${entryType === "entrada" ? "Entrada" : "Custo"}: ${costName} (OS ${service.id})`,
      account: "Dinheiro",
      category: entryType === "entrada" ? "Serviços" : "Custos Operacionais",
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

  const totalSaidas = currentCosts
    .filter((c: any) => c.type !== "entrada")
    .reduce((acc: number, curr: any) => acc + curr.value, 0);
  
  const totalEntradas = currentCosts
    .filter((c: any) => c.type === "entrada")
    .reduce((acc: number, curr: any) => acc + curr.value, 0);

  const saldo = totalEntradas - totalSaidas;

  return (
    <div className="space-y-4">
      {/* Type Toggle */}
      <div className="flex gap-2 p-1 bg-muted/30 rounded-xl border border-border">
        <button
          type="button"
          onClick={() => setEntryType("saida")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
            entryType === "saida"
              ? "bg-destructive/10 text-destructive border border-destructive/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowDownCircle className="w-4 h-4" />
          Custo / Saída
        </button>
        <button
          type="button"
          onClick={() => setEntryType("entrada")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
            entryType === "entrada"
              ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowUpCircle className="w-4 h-4" />
          Receita / Entrada
        </button>
      </div>

      {/* Add Form */}
      <div className="flex flex-col gap-3 pb-4 mb-4 border-b border-border/50">
        <div className="flex items-end gap-2">
          <div className="space-y-2 flex-1">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              {entryType === "entrada" ? "Nome da Receita" : "Nome do Custo"}
            </Label>
            <Input
              value={costName}
              onChange={e => setCostName(e.target.value)}
              placeholder={entryType === "entrada" ? "Ex: Adiantamento cliente" : "Ex: Peça Extra"}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="space-y-2 flex-1 relative">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Valor (R$)</Label>
            <Input
              type="number"
              value={costValue}
              onChange={e => setCostValue(e.target.value)}
              placeholder="0,00"
              className="h-10 rounded-xl font-mono"
            />
          </div>
          <Button
            onClick={handleAddCost}
            className={`h-10 px-3 rounded-xl ${
              entryType === "entrada"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Cost / Revenue List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
        {currentCosts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum lançamento adicionado.</p>
        ) : (
          currentCosts.map((cost: any) => {
            const isEntrada = cost.type === "entrada";
            return (
              <div key={cost.id} className={`flex items-center justify-between p-3 border rounded-xl bg-card ${
                isEntrada ? "border-emerald-500/20" : "border-border"
              }`}>
                <div className="flex items-center gap-2">
                  {isEntrada
                    ? <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    : <ArrowDownCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                  }
                  <span className="font-medium text-sm text-foreground">{cost.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-sm font-bold ${
                    isEntrada ? "text-emerald-600" : "text-destructive"
                  }`}>
                    {isEntrada ? "+" : "-"}{formatCurrency(cost.value)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCost(cost.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Totals */}
      <div className="pt-4 mt-2 border-t border-border/50 space-y-2">
        {totalEntradas > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Total Receitas</span>
            <span className="font-mono text-emerald-600 font-bold">+{formatCurrency(totalEntradas)}</span>
          </div>
        )}
        {totalSaidas > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Total Custos</span>
            <span className="font-mono text-destructive font-bold">-{formatCurrency(totalSaidas)}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-2 border-t border-border/50">
          <span className="font-bold uppercase tracking-wide text-muted-foreground text-sm">Saldo dos Lançamentos</span>
          <span className={`font-mono font-bold text-xl ${saldo >= 0 ? "text-emerald-600" : "text-destructive"}`}>
            {saldo >= 0 ? "+" : ""}{formatCurrency(saldo)}
          </span>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmRemoveCost}
        title="Remover lançamento"
        description="Tem certeza que deseja remover este lançamento? O registro financeiro vinculado também será removido."
        confirmLabel="Remover"
      />
    </div>
  );
}
