import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ClientFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function ClientForm({ onSave, onCancel, initialData }: ClientFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome / Empresa</Label>
        <Input id="name" defaultValue={initialData?.name} placeholder="Nome do cliente" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" defaultValue={initialData?.phone} placeholder="(00) 00000-0000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" defaultValue={initialData?.city} placeholder="Cidade" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" defaultValue={initialData?.notes} placeholder="Informações adicionais..." rows={3} />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSave}>{initialData ? 'Atualizar Cliente' : 'Criar Cliente'}</Button>
      </div>
    </div>
  );
}