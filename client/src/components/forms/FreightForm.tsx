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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Data</Label>
          <Input id="date" type="date" defaultValue={initialData?.date || new Date().toISOString().split('T')[0]} className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="machine" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Máquina Transportada</Label>
          <Input id="machine" defaultValue={initialData?.machine} placeholder="Qual equipamento?" className="h-11 sm:h-10 rounded-xl" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="origin" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Origem</Label>
          <Input id="origin" defaultValue={initialData?.origin} placeholder="De onde?" className="h-11 sm:h-10 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="destination" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Destino</Label>
          <Input id="destination" defaultValue={initialData?.destination} placeholder="Para onde?" className="h-11 sm:h-10 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="driver" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Motorista</Label>
          <Input id="driver" defaultValue={initialData?.driver} placeholder="Nome do motorista" className="h-11 sm:h-10 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="value" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Valor (R$)</Label>
          <Input id="value" type="number" defaultValue={initialData?.value} placeholder="0,00" className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 sm:mt-6 pt-4 border-t border-border/50">
        <Button variant="outline" onClick={onCancel} className="h-12 sm:h-10 rounded-xl flex-1 sm:flex-none">Cancelar</Button>
        <Button onClick={onSave} className="h-12 sm:h-10 rounded-xl font-bold flex-1 sm:flex-none">{initialData ? 'Atualizar Frete' : 'Salvar Frete'}</Button>
      </div>
    </div>
  );
}