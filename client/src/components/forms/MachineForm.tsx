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
        <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Nome da Máquina</Label>
        <Input id="name" defaultValue={initialData?.name} placeholder="Ex: Escavadeira 220 Nova" className="h-11 sm:h-10 rounded-xl" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="model" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Modelo</Label>
          <Input id="model" defaultValue={initialData?.model} placeholder="Ex: 220" className="h-11 sm:h-10 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Tipo</Label>
          <Input id="type" defaultValue={initialData?.type} placeholder="Ex: Escavadeira" className="h-11 sm:h-10 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Ano</Label>
          <Input id="year" type="number" defaultValue={initialData?.year} placeholder="2020" className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Custo / Hora</Label>
          <Input id="cost" type="number" defaultValue={initialData?.hour_cost} placeholder="0,00" className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="diesel" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Consumo Diesel</Label>
          <Input id="diesel" type="number" defaultValue={initialData?.diesel_consumption} placeholder="L/h" className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 sm:mt-6 pt-4 border-t border-border/50">
        <Button variant="outline" onClick={onCancel} className="h-12 sm:h-10 rounded-xl flex-1 sm:flex-none">Cancelar</Button>
        <Button onClick={onSave} className="h-12 sm:h-10 rounded-xl font-bold flex-1 sm:flex-none">{initialData ? 'Atualizar' : 'Cadastrar Máquina'}</Button>
      </div>
    </div>
  );
}