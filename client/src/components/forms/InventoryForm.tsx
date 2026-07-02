import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface InventoryFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export function InventoryForm({ onSave, onCancel, initialData }: InventoryFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    code: initialData?.code || "",
    quantity: initialData?.quantity || 0,
    minQuantity: initialData?.minQuantity || 0,
    unit: initialData?.unit || "unidades",
    unitPrice: initialData?.unitPrice || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Item</Label>
          <Input id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="Ex: Filtro de Óleo" className="rounded-xl h-12" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Código</Label>
          <Input id="code" name="code" required value={formData.code} onChange={handleChange} placeholder="Ex: FO-220" className="rounded-xl h-12" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade Atual</Label>
          <Input id="quantity" name="quantity" type="number" step="0.01" required value={formData.quantity} onChange={handleChange} className="rounded-xl h-12" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="minQuantity">Quantidade Mínima</Label>
          <Input id="minQuantity" name="minQuantity" type="number" step="0.01" required value={formData.minQuantity} onChange={handleChange} className="rounded-xl h-12" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="unit">Unidade de Medida</Label>
          <select 
            id="unit" 
            name="unit" 
            required 
            value={formData.unit} 
            onChange={handleChange} 
            className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="unidades">Unidades</option>
            <option value="litros">Litros</option>
            <option value="kg">Quilogramas (kg)</option>
            <option value="metros">Metros</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="unitPrice">Preço Unitário (R$)</Label>
          <Input id="unitPrice" name="unitPrice" type="number" step="0.01" required value={formData.unitPrice} onChange={handleChange} className="rounded-xl h-12" />
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl h-12 px-6">
          Cancelar
        </Button>
        <Button type="submit" className="rounded-xl h-12 px-6 bg-primary">
          Salvar
        </Button>
      </div>
    </form>
  );
}
