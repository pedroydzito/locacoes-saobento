import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OperatorTransactionFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  operatorId: string;
}

export function OperatorTransactionForm({ onSave, onCancel, operatorId }: OperatorTransactionFormProps) {
  const [formData, setFormData] = useState({
    operatorId,
    date: new Date().toISOString().split("T")[0],
    type: "Vale",
    amount: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: parseFloat(formData.amount.toString().replace(/\./g, "").replace(",", ".")),
    });
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value) {
      value = (parseInt(value, 10) / 100).toFixed(2);
      value = value.replace(".", ",");
      value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    }
    setFormData({ ...formData, amount: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data</Label>
          <Input 
            type="date" 
            value={formData.date} 
            onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
            required 
            className="rounded-xl h-11"
          />
        </div>
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger className="rounded-xl h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Vale">Vale</SelectItem>
              <SelectItem value="Adiantamento">Adiantamento</SelectItem>
              <SelectItem value="Bonificação">Bonificação</SelectItem>
              <SelectItem value="Desconto">Desconto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Valor (R$)</Label>
        <Input 
          type="text" 
          value={formData.amount} 
          onChange={handleCurrencyChange} 
          placeholder="0,00" 
          required 
          className="rounded-xl h-11"
        />
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Input 
          type="text" 
          value={formData.description} 
          onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
          placeholder="Ex: Vale farmácia" 
          required 
          className="rounded-xl h-11"
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-border mt-6">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl h-11 font-bold">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 rounded-xl h-11 font-bold">
          Lançar
        </Button>
      </div>
    </form>
  );
}
