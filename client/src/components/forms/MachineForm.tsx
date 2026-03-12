import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MachineFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function MachineForm({ onSave, onCancel, initialData }: MachineFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Máquina</Label>
        <Input id="name" defaultValue={initialData?.name} placeholder="Ex: Escavadeira 220 Nova" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="model">Modelo</Label>
          <Input id="model" defaultValue={initialData?.model} placeholder="Ex: 220" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Input id="type" defaultValue={initialData?.type} placeholder="Ex: Escavadeira" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Ano</Label>
          <Input id="year" type="number" defaultValue={initialData?.year} placeholder="2020" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost">Custo / Hora</Label>
          <Input id="cost" type="number" defaultValue={initialData?.hour_cost} placeholder="0,00" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="diesel">Consumo Diesel</Label>
          <Input id="diesel" type="number" defaultValue={initialData?.diesel_consumption} placeholder="L/h" />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSave}>{initialData ? 'Atualizar Máquina' : 'Cadastrar Máquina'}</Button>
      </div>
    </div>
  );
}