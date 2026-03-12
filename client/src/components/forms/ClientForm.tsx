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
        <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Nome / Empresa</Label>
        <Input id="name" defaultValue={initialData?.name} placeholder="Nome do cliente" className="h-11 sm:h-10 rounded-xl" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Telefone</Label>
          <Input id="phone" defaultValue={initialData?.phone} placeholder="(00) 00000-0000" className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Cidade</Label>
          <Input id="city" defaultValue={initialData?.city} placeholder="Cidade" className="h-11 sm:h-10 rounded-xl" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Observações</Label>
        <Textarea id="notes" defaultValue={initialData?.notes} placeholder="Informações adicionais..." rows={3} className="rounded-xl resize-none" />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 sm:mt-6 pt-4 border-t border-border/50">
        <Button variant="outline" onClick={onCancel} className="h-12 sm:h-10 rounded-xl flex-1 sm:flex-none">Cancelar</Button>
        <Button onClick={onSave} className="h-12 sm:h-10 rounded-xl font-bold flex-1 sm:flex-none">{initialData ? 'Atualizar' : 'Salvar'}</Button>
      </div>
    </div>
  );
}