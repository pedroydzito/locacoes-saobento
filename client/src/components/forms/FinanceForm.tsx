import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockAccounts, mockTransactions } from "@/lib/mock-data";

interface FinanceFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function FinanceForm({ onSave, onCancel, initialData }: FinanceFormProps) {
  const [formData, setFormData] = useState({
    type: initialData?.type || "entrada",
    date: initialData?.date || new Date().toISOString().split('T')[0],
    description: initialData?.description || "",
    category: initialData?.category || "",
    account: initialData?.account || "Sicoob",
    amount: initialData?.amount || ""
  });

  const handleSave = () => {
    if (!formData.description || !formData.amount) return;

    const currentUser = (localStorage.getItem("userRole") === "admin") ? "admin@saobento.com" : "operador@saobento.com";
    const amount = parseFloat(formData.amount.toString());

    if (initialData?.id) {
      // Edit existing
      const index = mockTransactions.findIndex(t => t.id === initialData.id);
      if (index !== -1) {
        mockTransactions[index] = {
          ...mockTransactions[index],
          ...formData,
          amount,
          // Keep original audit or update? Usually keep original createdAt but mark editor? 
          // For now let's just update the main fields.
        };
      }
    } else {
      // Create new
      mockTransactions.unshift({
        id: `tx-${Date.now()}`,
        ...formData,
        amount,
        createdAt: new Date().toISOString(),
        createdBy: currentUser,
        relatedCostId: undefined,
        relatedServiceId: undefined
      });
    }

    onSave();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Tipo</Label>
          <Select 
            value={formData.type} 
            onValueChange={(v) => setFormData({...formData, type: v})}
          >
            <SelectTrigger className="h-11 sm:h-10 rounded-xl">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="entrada" className="font-medium text-success">Entrada (+)</SelectItem>
              <SelectItem value="saida" className="font-medium text-destructive">Saída (-)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Data</Label>
          <Input 
            id="date" 
            type="date" 
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="h-11 sm:h-10 rounded-xl font-mono" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Descrição</Label>
        <Input 
          id="description" 
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Descrição do lançamento" 
          className="h-11 sm:h-10 rounded-xl" 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Categoria</Label>
          <Input 
            id="category" 
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            placeholder="Ex: Serviços, Diesel..." 
            className="h-11 sm:h-10 rounded-xl" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Conta</Label>
          <Select 
            value={formData.account}
            onValueChange={(v) => setFormData({...formData, account: v})}
          >
            <SelectTrigger className="h-11 sm:h-10 rounded-xl">
              <SelectValue placeholder="Selecione a conta" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {mockAccounts.map(acc => (
                <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Valor (R$)</Label>
        <Input 
          id="amount" 
          type="number" 
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
          placeholder="0,00" 
          className="h-11 sm:h-10 rounded-xl font-mono text-lg font-bold" 
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 sm:mt-6 pt-4 border-t border-border/50">
        <Button variant="outline" onClick={onCancel} className="h-12 sm:h-10 rounded-xl flex-1 sm:flex-none">Cancelar</Button>
        <Button onClick={handleSave} className="h-12 sm:h-10 rounded-xl font-bold flex-1 sm:flex-none">{initialData?.id ? 'Atualizar' : 'Salvar Lançamento'}</Button>
      </div>
    </div>
  );
}