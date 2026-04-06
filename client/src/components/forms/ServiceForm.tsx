import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockMachines, mockOperators, mockClients, mockServices, mockTransactions } from "@/lib/mock-data";

interface ServiceFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function ServiceForm({ onSave, onCancel, initialData }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    client: initialData?.client || "",
    machine: initialData?.machine || "",
    operator: initialData?.operator || "",
    date: initialData?.date || new Date().toISOString().split('T')[0],
    hora_inicial: initialData?.hora_inicial || "08:00",
    hora_final: initialData?.hora_final || "17:00",
    diesel: initialData?.diesel || 0,
    value: initialData?.value || 0,
    status: initialData?.status || "andamento"
  });

  const parseTime = (timeStr: string) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
  };

  const isTimeValid = () => {
    if (!formData.hora_inicial || !formData.hora_final) return false;
    return formData.hora_final > formData.hora_inicial;
  };

  const handleSave = () => {
    if (!isTimeValid()) return;
    if (!formData.client || !formData.machine || !formData.operator) return;

    const start = parseTime(formData.hora_inicial);
    const end = parseTime(formData.hora_final);
    let hoursWorked = end - start;
    if (hoursWorked < 0) hoursWorked += 24;

    const machineObj = mockMachines.find(m => m.name === formData.machine);
    const operatorObj = mockOperators.find(o => o.name === formData.operator);

    const cost_machine = hoursWorked * (machineObj?.hour_cost || 0);
    const cost_operator = hoursWorked * ((operatorObj?.salary || 0) / 220);
    const cost_diesel = (formData.diesel || 0) * 6.50;

    const additionalCosts = [
      { id: `cst-${Date.now()}-1`, name: "Custo Máquina", value: cost_machine, createdAt: new Date().toISOString(), createdBy: "admin@saobento.com" },
      { id: `cst-${Date.now()}-2`, name: "Custo Operador", value: cost_operator, createdAt: new Date().toISOString(), createdBy: "admin@saobento.com" },
      { id: `cst-${Date.now()}-3`, name: "Custo Diesel", value: cost_diesel, createdAt: new Date().toISOString(), createdBy: "admin@saobento.com" }
    ];

    const total_costs = additionalCosts.reduce((acc, curr) => acc + curr.value, 0);
    const profit = (formData.value || 0) - total_costs;
    const serviceData = {
      ...formData,
      id: initialData?.id || `SRV-${1000 + mockServices.length + 1}`,
      hours: hoursWorked,
      freight: 0,
      notes: "",
      costs: {
        machine: cost_machine,
        operator: cost_operator,
        diesel: cost_diesel
      },
      additionalCosts,
      profit
    };

    if (initialData?.id) {
      const idx = mockServices.findIndex(s => s.id === initialData.id);
      if (idx !== -1) mockServices[idx] = serviceData;
    } else {
      mockServices.unshift(serviceData);
    }

    // Gerar lançamentos financeiros de custo automaticamente
    additionalCosts.forEach(cost => {
      mockTransactions.unshift({
        id: `tx-${Date.now()}-${cost.name.replace(/\s/g, '')}-${Math.random().toString(36).substr(2, 5)}`,
        type: "saida",
        amount: cost.value,
        date: formData.date,
        description: `${cost.name} - ${serviceData.id} (${formData.machine})`,
        account: "Sicoob",
        category: cost.name.includes("Diesel") ? "Diesel" : "Manutenção/Operacional",
        supplier: "São Bento Logística", // Auto-supplier
        dueDate: formData.date,
        allocation: formData.machine,
        createdAt: new Date().toISOString(),
        createdBy: "admin@saobento.com",
        relatedCostId: cost.id,
        relatedServiceId: serviceData.id
      });
    });

    onSave();
  };

  const sortedMachines = [...mockMachines].sort((a, b) => a.name.localeCompare(b.name));
  const sortedOperators = [...mockOperators].sort((a, b) => a.name.localeCompare(b.name));
  const sortedClients = [...mockClients].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Cliente / Obra</Label>
          <Select 
            value={formData.client} 
            onValueChange={(v) => setFormData({...formData, client: v})}
          >
            <SelectTrigger className="h-11 rounded-xl border-border bg-muted/10">
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent className="rounded-xl z-50 border-border">
              {sortedClients.map((c) => (
                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Data do Serviço</Label>
          <Input 
            type="date" 
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="h-11 rounded-xl border-border bg-muted/10 font-mono" 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Equipamento / Máquina</Label>
          <Select 
            value={formData.machine} 
            onValueChange={(v) => setFormData({...formData, machine: v})}
          >
            <SelectTrigger className="h-11 rounded-xl border-border bg-muted/10">
              <SelectValue placeholder="Selecione a máquina" />
            </SelectTrigger>
            <SelectContent className="rounded-xl z-50 border-border">
              {sortedMachines.map((m) => (
                <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Operador Responsável</Label>
          <Select 
            value={formData.operator} 
            onValueChange={(v) => setFormData({...formData, operator: v})}
          >
            <SelectTrigger className="h-11 rounded-xl border-border bg-muted/10">
              <SelectValue placeholder="Selecione o operador" />
            </SelectTrigger>
            <SelectContent className="rounded-xl z-50 border-border">
              {sortedOperators.map((o) => (
                <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">H. Inicial</Label>
          <Input 
            type="time" 
            value={formData.hora_inicial} 
            onChange={(e) => setFormData({...formData, hora_inicial: e.target.value})} 
            className="h-11 rounded-xl border-border bg-muted/10 font-mono" 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">H. Final</Label>
          <Input 
            type="time" 
            value={formData.hora_final} 
            onChange={(e) => setFormData({...formData, hora_final: e.target.value})} 
            className={`h-11 rounded-xl border-border bg-muted/10 font-mono ${!isTimeValid() ? 'border-destructive text-destructive' : ''}`} 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Diesel (L)</Label>
          <Input 
            type="number" 
            value={formData.diesel} 
            onChange={(e) => setFormData({...formData, diesel: parseFloat(e.target.value) || 0})}
            placeholder="0" 
            className="h-11 rounded-xl border-border bg-muted/10 font-mono" 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 text-primary">Valor (R$)</Label>
          <Input 
            type="number" 
            value={formData.value} 
            onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
            placeholder="0,00" 
            className="h-11 rounded-xl border-border bg-primary/5 font-bold text-primary font-mono" 
          />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-border/60">
        <Button variant="outline" onClick={onCancel} className="h-11 rounded-xl flex-1 border-border hover:bg-muted/50 transition-colors">Cancelar</Button>
        <Button onClick={handleSave} disabled={!isTimeValid()} className="h-11 rounded-xl font-bold flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-none transition-all active:scale-[0.98]">
          {initialData ? 'Atualizar Serviço' : 'Salvar OS e Gerar Custos'}
        </Button>
      </div>
    </div>
  );
}