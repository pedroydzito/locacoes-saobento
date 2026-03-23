import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockMachines, mockOperators, mockClients } from "@/lib/mock-data";

interface ServiceFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function ServiceForm({ onSave, onCancel, initialData }: ServiceFormProps) {
  const [horaInicial, setHoraInicial] = useState(initialData?.hora_inicial || "00:00");
  const [horaFinal, setHoraFinal] = useState(initialData?.hora_final || "01:00");

  const isTimeValid = () => {
    if (!horaInicial || !horaFinal) return false;
    return horaFinal > horaInicial;
  };

  const handleSave = () => {
    if (isTimeValid()) {
      onSave();
    }
  };

  const sortedMachines = [...mockMachines].sort((a, b) => a.name.localeCompare(b.name));
  const sortedOperators = [...mockOperators].sort((a, b) => a.name.localeCompare(b.name));
  const sortedClients = [...mockClients].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Cliente / Obra</Label>
          <Select defaultValue={initialData?.client || ""}>
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
        <div className="space-y-2">
          <Label htmlFor="date" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Data</Label>
          <Input id="date" type="date" defaultValue={initialData?.date || new Date().toISOString().split('T')[0]} className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="machine" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Máquina</Label>
          <Select defaultValue={initialData?.machine || ""}>
            <SelectTrigger className="h-11 sm:h-10 rounded-xl bg-background border-border">
              <SelectValue placeholder="Selecione a máquina" />
            </SelectTrigger>
            <SelectContent className="rounded-xl z-50 max-h-[200px] overflow-y-auto">
              {sortedMachines.map((m) => (
                <SelectItem key={m.id} value={m.name} className="cursor-pointer">{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="operator" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Operador</Label>
          <Select defaultValue={initialData?.operator || ""}>
            <SelectTrigger className="h-11 sm:h-10 rounded-xl bg-background border-border">
              <SelectValue placeholder="Selecione o operador" />
            </SelectTrigger>
            <SelectContent className="rounded-xl z-50 max-h-[200px] overflow-y-auto">
              {sortedOperators.map((o) => (
                <SelectItem key={o.id} value={o.name} className="cursor-pointer">{o.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hora_inicial" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Hora Inicial</Label>
          <Input id="hora_inicial" type="time" value={horaInicial} onChange={(e) => setHoraInicial(e.target.value)} className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hora_final" className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex justify-between">
            <span>Hora Final</span>
            {!isTimeValid() && <span className="text-destructive font-normal normal-case">Maior que inicial</span>}
          </Label>
          <Input id="hora_final" type="time" value={horaFinal} onChange={(e) => setHoraFinal(e.target.value)} className={`h-11 sm:h-10 rounded-xl font-mono ${!isTimeValid() ? 'border-destructive focus-visible:ring-destructive' : ''}`} />
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
        <Button onClick={handleSave} disabled={!isTimeValid()} className="h-12 sm:h-10 rounded-xl font-bold flex-1 sm:flex-none">{initialData ? 'Atualizar' : 'Criar Serviço'}</Button>
      </div>
    </div>
  );
}