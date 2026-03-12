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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Cliente / Obra</Label>
          <Input id="client" defaultValue={initialData?.client} placeholder="Nome do cliente" className="h-11 sm:h-10 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Data</Label>
          <Input id="date" type="date" defaultValue={initialData?.date || new Date().toISOString().split('T')[0]} className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="machine" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Máquina</Label>
          <Input id="machine" defaultValue={initialData?.machine} placeholder="Selecione a máquina" className="h-11 sm:h-10 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="operator" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Operador</Label>
          <Input id="operator" defaultValue={initialData?.operator} placeholder="Selecione o operador" className="h-11 sm:h-10 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hours" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Horas (h)</Label>
          <Input id="hours" type="number" defaultValue={initialData?.hours} placeholder="0" className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="diesel" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Diesel (L)</Label>
          <Input id="diesel" type="number" defaultValue={initialData?.diesel} placeholder="0" className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="value" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Valor Total (R$)</Label>
          <Input id="value" type="number" defaultValue={initialData?.value} placeholder="0,00" className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 sm:mt-6 pt-4 border-t border-border/50">
        <Button variant="outline" onClick={onCancel} className="h-12 sm:h-10 rounded-xl flex-1 sm:flex-none">Cancelar</Button>
        <Button onClick={onSave} className="h-12 sm:h-10 rounded-xl font-bold flex-1 sm:flex-none">{initialData ? 'Atualizar' : 'Criar Serviço'}</Button>
      </div>
    </div>
  );
}