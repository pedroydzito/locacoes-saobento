import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OperatorFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function OperatorForm({ onSave, onCancel, initialData }: OperatorFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Nome do Operador</Label>
        <Input id="name" defaultValue={initialData?.name} placeholder="Nome completo" className="h-11 sm:h-10 rounded-xl" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="salary" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Salário Base (R$)</Label>
          <Input id="salary" type="number" defaultValue={initialData?.salary} placeholder="0,00" className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="machine" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Máquina Principal</Label>
          <Input id="machine" defaultValue={initialData?.machine_assigned} placeholder="Máquina padrão" className="h-11 sm:h-10 rounded-xl" />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 sm:mt-6 pt-4 border-t border-border/50">
        <Button variant="outline" onClick={onCancel} className="h-12 sm:h-10 rounded-xl flex-1 sm:flex-none">Cancelar</Button>
        <Button onClick={onSave} className="h-12 sm:h-10 rounded-xl font-bold flex-1 sm:flex-none">{initialData ? 'Atualizar' : 'Cadastrar Operador'}</Button>
      </div>
    </div>
  );
}