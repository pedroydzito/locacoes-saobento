import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockMachines, mockOperators, mockClients, mockServices, mockTransactions, areaOptionsList } from "@/lib/mock-data";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";

interface ServiceFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function ServiceForm({ onSave, onCancel, initialData }: ServiceFormProps) {
  const initialArea = initialData?.area || initialData?.serviceType || "";
  const isInitialOther = initialArea && !areaOptionsList.slice(0, -1).includes(initialArea);

  const [formData, setFormData] = useState({
    client: initialData?.client || "",
    date: initialData?.date || new Date().toISOString().split('T')[0],
    area: isInitialOther ? "Outro" : initialArea,
    areaCustom: isInitialOther ? initialArea : "",
    fixedValue: initialData?.fixedValue || 0,
    hourlyValue: initialData?.hourlyValue || 0,
    status: initialData?.status || "em_andamento"
  });

  const [machineAssignments, setMachineAssignments] = useState<any[]>(
    initialData?.machines && initialData.machines.length > 0
      ? initialData.machines.map((m: any) => ({
          machineName: m.machineName,
          operatorName: m.operatorName,
          hora_inicial: m.horaInicial?.toString() || "",
          hora_final: m.horaFinal?.toString() || "",
          diesel: m.diesel?.toString() || "0",
          dieselSupplier: m.dieselSupplier || "cliente"
        }))
      : [{
          machineName: "",
          operatorName: "",
          hora_inicial: "",
          hora_final: "",
          diesel: "0",
          dieselSupplier: "cliente"
        }]
  );
  
  const [photos, setPhotos] = useState<any[]>(initialData?.photos || []);
  const [isUploading, setIsUploading] = useState(false);

  const isTimeValid = () => {
    return machineAssignments.every(ma => {
      if (!ma.hora_inicial) return false;
      if (ma.hora_final && parseFloat(ma.hora_final) <= parseFloat(ma.hora_inicial)) return false;
      return true;
    });
  };

  const handlePhotoUpload = () => {
    if (photos.length >= 5) return;
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      const machineNames = machineAssignments.map(m => m.machineName).join('_');
      const newPhoto = { url: `painel_maq_${machineNames}_${photos.length + 1}.jpg`, label: "Foto do Painel" };
      setPhotos([...photos, newPhoto]);
    }, 1500);
  };

  const handleAddMachine = () => {
    setMachineAssignments([...machineAssignments, {
      machineName: "",
      operatorName: "",
      hora_inicial: "",
      hora_final: "",
      diesel: "0",
      dieselSupplier: "cliente"
    }]);
  };

  const handleRemoveMachine = (index: number) => {
    if (machineAssignments.length > 1) {
      const newArr = [...machineAssignments];
      newArr.splice(index, 1);
      setMachineAssignments(newArr);
    }
  };

  const updateMachine = (index: number, field: string, value: any) => {
    const newArr = [...machineAssignments];
    newArr[index][field] = value;
    setMachineAssignments(newArr);
  };

  const handleSave = () => {
    if (!isTimeValid()) return;
    if (!formData.client || machineAssignments.some(m => !m.machineName || !m.operatorName)) return;

    let totalHours = 0;
    let totalMachineCost = 0;
    let totalOperatorCost = 0;
    let totalDieselCost = 0;
    let totalDieselLiters = 0;

    const machinesData = machineAssignments.map(ma => {
      const start = parseFloat(ma.hora_inicial);
      const end = ma.hora_final ? parseFloat(ma.hora_final) : start;
      const hoursWorked = end > start ? end - start : 0;
      totalHours += hoursWorked;

      const machineObj = mockMachines.find(m => m.name === ma.machineName);
      const cost_m = hoursWorked * (machineObj?.hour_cost || 0);
      totalMachineCost += cost_m;

      const operatorObj = mockOperators.find(o => o.name === ma.operatorName);
      const cost_o = hoursWorked * ((operatorObj?.salary || 0) / 220);
      totalOperatorCost += cost_o;

      const diesel = parseFloat(ma.diesel) || 0;
      totalDieselLiters += diesel;
      const cost_d = ma.dieselSupplier === 'sao_bento' ? diesel * 6.50 : 0;
      totalDieselCost += cost_d;

      return {
        machineName: ma.machineName,
        operatorName: ma.operatorName,
        horaInicial: start,
        horaFinal: ma.hora_final ? end : undefined,
        hours: hoursWorked > 0 ? hoursWorked : undefined,
        diesel: diesel,
        dieselSupplier: ma.dieselSupplier,
        status: ma.hora_final ? "concluido" : "em_andamento"
      };
    });

    const additionalCosts = [
      { id: `cst-${Date.now()}-1`, name: "Custo Máquina", value: totalMachineCost, createdAt: new Date().toISOString(), createdBy: "admin@saobento.com" },
      { id: `cst-${Date.now()}-2`, name: "Custo Operador", value: totalOperatorCost, createdAt: new Date().toISOString(), createdBy: "admin@saobento.com" }
    ];

    if (totalDieselCost > 0) {
      additionalCosts.push({ id: `cst-${Date.now()}-3`, name: "Custo Diesel (São Bento)", value: totalDieselCost, createdAt: new Date().toISOString(), createdBy: "admin@saobento.com" });
    }

    const total_costs = additionalCosts.reduce((acc, curr) => acc + curr.value, 0);
    const totalRevenue = (formData.fixedValue || 0) + (totalHours * (formData.hourlyValue || 0));
    const profit = totalRevenue - total_costs;
    const resolvedArea = formData.area === "Outro" ? formData.areaCustom : formData.area;
    
    const machineNamesStr = machinesData.map(m => m.machineName).join(', ');
    const firstMachine = machinesData[0];

    const serviceData = {
      ...formData,
      machine: machineNamesStr,
      operator: machinesData.length === 1 ? firstMachine.operatorName : "Múltiplos",
      area: resolvedArea,
      serviceType: resolvedArea, // legacy
      id: initialData?.id || `SRV-${1000 + mockServices.length + 1}`,
      hora_inicial: firstMachine.horaInicial,
      hora_final: machinesData.every(m => m.horaFinal) ? Math.max(...machinesData.map(m => m.horaFinal!)) : undefined,
      hours: totalHours,
      diesel: totalDieselLiters,
      dieselSupplier: firstMachine.dieselSupplier, // legacy flat
      freight: 0,
      notes: "",
      photos: photos,
      machines: machinesData,
      costs: {
        machine: totalMachineCost,
        operator: totalOperatorCost,
        diesel: totalDieselCost
      },
      additionalCosts,
      profit
    };

    if (initialData?.id) {
      const idx = mockServices.findIndex(s => s.id === initialData.id);
      if (idx !== -1) mockServices[idx] = serviceData as any;
    } else {
      mockServices.unshift(serviceData as any);
    }

    // Gerar lançamentos financeiros
    additionalCosts.forEach(cost => {
      mockTransactions.unshift({
        id: `tx-${Date.now()}-${cost.name.replace(/\s/g, '')}-${Math.random().toString(36).substr(2, 5)}`,
        type: "saida",
        amount: cost.value,
        date: formData.date,
        description: `${cost.name} - ${serviceData.id} (${machineNamesStr})`,
        account: "Sicoob",
        category: cost.name.includes("Diesel") ? "Diesel" : "Manutenção/Operacional",
        supplier: "São Bento Logística",
        dueDate: formData.date,
        allocation: machineNamesStr,
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
            <SelectContent className="rounded-xl z-[100] border-border">
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
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Área</Label>
          <Select
            value={formData.area}
            onValueChange={(v) => setFormData({...formData, area: v, areaCustom: v !== "Outro" ? "" : formData.areaCustom})}
          >
            <SelectTrigger className="h-11 rounded-xl border-border bg-muted/10">
              <SelectValue placeholder="Selecione a área" />
            </SelectTrigger>
            <SelectContent className="rounded-xl z-[100] border-border">
              {areaOptionsList.map((area) => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.area === "Outro" && (
            <Input
              placeholder="Descreva a área..."
              value={formData.areaCustom}
              onChange={(e) => setFormData({...formData, areaCustom: e.target.value})}
              className="h-11 rounded-xl border-border bg-muted/10 mt-2"
            />
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Status Geral</Label>
          <Select 
            value={formData.status} 
            onValueChange={(v) => setFormData({...formData, status: v})}
          >
            <SelectTrigger className="h-11 rounded-xl border-border bg-muted/10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl z-[100] border-border">
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="parcialmente_concluido">Parcialmente Concluído</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <Label className="text-[12px] font-bold text-foreground uppercase tracking-widest ml-1">Máquinas Alocadas</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddMachine} className="rounded-xl gap-2 h-8">
            <Plus className="w-3.5 h-3.5" /> Adicionar Máquina
          </Button>
        </div>

        {machineAssignments.map((ma, index) => (
          <div key={index} className="p-4 rounded-xl border border-border bg-card relative space-y-4">
            {machineAssignments.length > 1 && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full"
                onClick={() => handleRemoveMachine(index)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Equipamento</Label>
                <Select 
                  value={ma.machineName} 
                  onValueChange={(v) => updateMachine(index, "machineName", v)}
                >
                  <SelectTrigger className="h-10 rounded-lg border-border bg-muted/10">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg z-[100] border-border">
                    {sortedMachines.map((m) => (
                      <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Operador</Label>
                <Select 
                  value={ma.operatorName} 
                  onValueChange={(v) => updateMachine(index, "operatorName", v)}
                >
                  <SelectTrigger className="h-10 rounded-lg border-border bg-muted/10">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg z-[100] border-border">
                    {sortedOperators.map((o) => (
                      <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Horímetro Inicial</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  value={ma.hora_inicial} 
                  onChange={(e) => updateMachine(index, "hora_inicial", e.target.value)} 
                  className="h-10 rounded-lg border-border bg-muted/10 font-mono" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Horímetro Final</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  value={ma.hora_final} 
                  onChange={(e) => updateMachine(index, "hora_final", e.target.value)} 
                  className="h-10 rounded-lg border-border bg-muted/10 font-mono" 
                  placeholder="(Opcional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Diesel (L)</Label>
                <Input 
                  type="number" 
                  value={ma.diesel} 
                  onChange={(e) => updateMachine(index, "diesel", e.target.value)}
                  className="h-10 rounded-lg border-border bg-muted/10 font-mono" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Fornec. Diesel</Label>
                <Select 
                  value={ma.dieselSupplier} 
                  onValueChange={(v) => updateMachine(index, "dieselSupplier", v)}
                >
                  <SelectTrigger className="h-10 rounded-lg border-border bg-muted/10">
                    <SelectValue placeholder="Fornecedor" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg z-[100] border-border">
                    <SelectItem value="cliente">Cliente (Sem Custo)</SelectItem>
                    <SelectItem value="sao_bento">São Bento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 text-primary">Fixo (R$)</Label>
          <Input 
            type="number" 
            value={formData.fixedValue} 
            onChange={(e) => setFormData({...formData, fixedValue: parseFloat(e.target.value) || 0})}
            placeholder="0,00" 
            className="h-11 rounded-xl border-border bg-primary/5 font-bold text-primary font-mono" 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 text-primary">Hora (R$/h)</Label>
          <Input 
            type="number" 
            value={formData.hourlyValue} 
            onChange={(e) => setFormData({...formData, hourlyValue: parseFloat(e.target.value) || 0})}
            placeholder="0,00" 
            className="h-11 rounded-xl border-border bg-primary/5 font-bold text-primary font-mono" 
          />
        </div>
      </div>

      <div className="space-y-2 mt-4 p-4 border border-dashed border-border rounded-xl bg-card">
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Comprovante (Fotos do Painel)</Label>
        <div className="flex items-center gap-4 mt-2">
          <Button 
            variant="outline" 
            type="button"
            className="rounded-xl h-10 hover:bg-muted/50 transition-colors relative overflow-hidden"
            onClick={handlePhotoUpload}
            disabled={isUploading || photos.length >= 5}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                Enviando...
              </span>
            ) : photos.length >= 5 ? (
              <span className="flex items-center gap-2 text-success">
                <span className="w-2 h-2 rounded-full bg-success" />
                Limite atingido
              </span>
            ) : (
              `📸 Anexar Foto (${photos.length}/5)`
            )}
          </Button>
          {photos.length > 0 && (
            <div className="flex flex-col gap-1 mt-2 sm:mt-0">
              {photos.map((photo, i) => {
                const photoName = typeof photo === 'string' ? photo : photo.url;
                return (
                <span key={i} className="text-xs text-muted-foreground animate-in fade-in flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-success" />
                  {photoName}
                </span>
                );
              })}
            </div>
          )}
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