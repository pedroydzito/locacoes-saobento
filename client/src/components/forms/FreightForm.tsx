import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockClients } from "@/lib/mock-data";

interface FreightFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function FreightForm({ onSave, onCancel, initialData }: FreightFormProps) {
  const sortedClients = [...mockClients].sort((a, b) => a.name.localeCompare(b.name));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    onSave({
      ...data,
      value: Number(data.value) || 0,
      km_inicial: Number(data.km_inicial) || 0,
      km_final: Number(data.km_final) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 mb-2">
        <Label htmlFor="client" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Cliente Solicitante</Label>
        <Select name="client" defaultValue={initialData?.client || ""}>
          <SelectTrigger className="h-11 sm:h-10 rounded-xl bg-background border-border">
            <SelectValue placeholder="Selecione o cliente" />
          </SelectTrigger>
          <SelectContent className="rounded-xl z-50 max-h-[200px] overflow-y-auto">
            {sortedClients.map((c) => (
              <SelectItem key={c.id} value={c.name} className="cursor-pointer">{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Data</Label>
          <Input id="date" name="date" type="date" defaultValue={initialData?.date || new Date().toISOString().split('T')[0]} className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="machine" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Máquina Transportada</Label>
          <Input id="machine" name="machine" defaultValue={initialData?.machine} placeholder="Qual equipamento?" className="h-11 sm:h-10 rounded-xl" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="origin" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Origem</Label>
          <Input id="origin" name="origin" defaultValue={initialData?.origin} placeholder="De onde?" className="h-11 sm:h-10 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="destination" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Destino</Label>
          <Input id="destination" name="destination" defaultValue={initialData?.destination} placeholder="Para onde?" className="h-11 sm:h-10 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="driver" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Motorista</Label>
          <Input id="driver" name="driver" defaultValue={initialData?.driver} placeholder="Nome do motorista" className="h-11 sm:h-10 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="value" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Valor (R$)</Label>
          <Input id="value" name="value" type="number" defaultValue={initialData?.value} placeholder="0,00" className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="km_inicial" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">KM Inicial</Label>
          <Input id="km_inicial" name="km_inicial" type="number" defaultValue={initialData?.km_inicial} placeholder="Ex: 150000" className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="km_final" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">KM Final</Label>
          <Input id="km_final" name="km_final" type="number" defaultValue={initialData?.km_final} placeholder="Ex: 150500" className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Observações</Label>
        <Textarea id="notes" name="notes" defaultValue={initialData?.notes} placeholder="Adicione alguma observação sobre o frete..." className="resize-none min-h-[80px] rounded-xl" />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Status Atual</Label>
        <Select name="status" defaultValue={initialData?.status || "planejado"}>
          <SelectTrigger className="h-11 sm:h-10 rounded-xl bg-background border-border">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl z-50">
            <SelectItem value="planejado">Planejado</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 sm:mt-6 pt-4 border-t border-border/50">
        <Button type="button" variant="outline" onClick={onCancel} className="h-12 sm:h-10 rounded-xl flex-1 sm:flex-none">Cancelar</Button>
        <Button type="submit" className="h-12 sm:h-10 rounded-xl font-bold flex-1 sm:flex-none">{initialData ? 'Atualizar Frete' : 'Salvar Frete'}</Button>
      </div>
    </form>
  );
}