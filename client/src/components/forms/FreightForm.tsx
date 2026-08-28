import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockClients, mockDrivers, getFreightKmTotal } from "@/lib/mock-data";

interface FreightFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export function FreightForm({ onSave, onCancel, initialData }: FreightFormProps) {
  const sortedClients = [...mockClients].sort((a, b) => a.name.localeCompare(b.name));
  const [kmInicial, setKmInicial] = useState(initialData?.km_inicial ? String(initialData.km_inicial) : "");
  const [kmFinal, setKmFinal] = useState(initialData?.km_final ? String(initialData.km_final) : "");
  const [pricePerKm, setPricePerKm] = useState(initialData?.price_per_km ? String(initialData.price_per_km) : "");

  const kmTotal = useMemo(
    () => getFreightKmTotal({ km_inicial: Number(kmInicial) || 0, km_final: Number(kmFinal) || 0 }),
    [kmInicial, kmFinal]
  );
  const rate = Number(pricePerKm) || 0;
  const totalValue = kmTotal > 0 && rate > 0 ? kmTotal * rate : 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    onSave({
      ...data,
      km_inicial: Number(kmInicial) || 0,
      km_final: kmFinal ? Number(kmFinal) : undefined,
      price_per_km: rate,
      value: totalValue,
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
          <Label htmlFor="machine" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">O que está transportando</Label>
          <Input id="machine" name="machine" defaultValue={initialData?.machine} placeholder="Máquina ou carga" className="h-11 sm:h-10 rounded-xl" />
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

      <div className="space-y-2">
        <Label htmlFor="driver" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Motorista</Label>
        <Select name="driver" defaultValue={initialData?.driver || mockDrivers[0]?.name || ""}>
          <SelectTrigger className="h-11 sm:h-10 rounded-xl bg-background border-border">
            <SelectValue placeholder="Selecione o motorista" />
          </SelectTrigger>
          <SelectContent className="rounded-xl z-50">
            {mockDrivers.map((d) => (
              <SelectItem key={d.id} value={d.name} className="cursor-pointer">{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="km_inicial" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">KM Inicial</Label>
          <Input id="km_inicial" name="km_inicial" type="number" value={kmInicial} onChange={(e) => setKmInicial(e.target.value)} placeholder="Ex: 150000" className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="km_final" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">KM Final</Label>
          <Input id="km_final" name="km_final" type="number" value={kmFinal} onChange={(e) => setKmFinal(e.target.value)} placeholder="Ex: 150500" className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="price_per_km" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Valor por KM (R$)</Label>
        <Input id="price_per_km" name="price_per_km" type="number" step="0.01" value={pricePerKm} onChange={(e) => setPricePerKm(e.target.value)} placeholder="Ex: 1,16" className="h-11 sm:h-10 rounded-xl font-mono" />
      </div>

      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Valor calculado</p>
        {kmTotal > 0 && rate > 0 ? (
          <p className="font-bold text-lg text-primary">
            {kmTotal.toLocaleString("pt-BR")} km × {formatCurrency(rate)} = {formatCurrency(totalValue)}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Informe KM inicial, KM final e o valor por km para calcular o total.
          </p>
        )}
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
