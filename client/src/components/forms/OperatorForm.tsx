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
        <Label htmlFor="name">Nome do Operador</Label>
        <Input id="name" defaultValue={initialData?.name} placeholder="Nome completo" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="salary">Salário Base (R$)</Label>
          <Input id="salary" type="number" defaultValue={initialData?.salary} placeholder="0,00" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="machine">Máquina Principal</Label>
          <Input id="machine" defaultValue={initialData?.machine_assigned} placeholder="Máquina padrão" />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSave}>{initialData ? 'Atualizar Operador' : 'Cadastrar Operador'}</Button>
      </div>
    </div>
  );
}