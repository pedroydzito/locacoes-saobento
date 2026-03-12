import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FreightFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function FreightForm({ onSave, onCancel, initialData }: FreightFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input id="date" type="date" defaultValue={initialData?.date || new Date().toISOString().split('T')[0]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="machine">Máquina Transportada</Label>
          <Input id="machine" defaultValue={initialData?.machine} placeholder="Qual equipamento?" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="origin">Origem</Label>
          <Input id="origin" defaultValue={initialData?.origin} placeholder="De onde?" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="destination">Destino</Label>
          <Input id="destination" defaultValue={initialData?.destination} placeholder="Para onde?" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="driver">Motorista</Label>
          <Input id="driver" defaultValue={initialData?.driver} placeholder="Nome do motorista" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Valor (R$)</Label>
          <Input id="value" type="number" defaultValue={initialData?.value} placeholder="0,00" />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSave}>{initialData ? 'Atualizar Frete' : 'Salvar Frete'}</Button>
      </div>
    </div>
  );
}