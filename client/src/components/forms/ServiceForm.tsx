import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ServiceFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function ServiceForm({ onSave, onCancel, initialData }: ServiceFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client">Cliente / Obra</Label>
          <Input id="client" defaultValue={initialData?.client} placeholder="Nome do cliente" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input id="date" type="date" defaultValue={initialData?.date || new Date().toISOString().split('T')[0]} />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="machine">Máquina</Label>
          <Input id="machine" defaultValue={initialData?.machine} placeholder="Selecione a máquina" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="operator">Operador</Label>
          <Input id="operator" defaultValue={initialData?.operator} placeholder="Selecione o operador" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hours">Horas (h)</Label>
          <Input id="hours" type="number" defaultValue={initialData?.hours} placeholder="0" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="diesel">Diesel (L)</Label>
          <Input id="diesel" type="number" defaultValue={initialData?.diesel} placeholder="0" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Valor Total (R$)</Label>
          <Input id="value" type="number" defaultValue={initialData?.value} placeholder="0,00" />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSave}>{initialData ? 'Atualizar Serviço' : 'Criar Serviço'}</Button>
      </div>
    </div>
  );
}