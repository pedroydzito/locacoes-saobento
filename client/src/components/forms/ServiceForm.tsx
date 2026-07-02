import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { mockMachines, mockOperators, mockClients, mockServices, mockTransactions } from "@/lib/mock-data";
import { CheckCircle2 } from "lucide-react";

interface ServiceFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function ServiceForm({ onSave, onCancel, initialData }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    client: initialData?.client || "",
    machines: initialData?.machine ? initialData.machine.split(', ') : [],
    operator: initialData?.operator || "",
    date: initialData?.date || new Date().toISOString().split('T')[0],
    hora_inicial: initialData?.hora_inicial || "",
    hora_final: initialData?.hora_final || "",
    diesel: initialData?.diesel || 0,
    dieselSupplier: initialData?.dieselSupplier || "cliente",
    serviceType: initialData?.serviceType || "",
    fixedValue: initialData?.fixedValue || 0,
    hourlyValue: initialData?.hourlyValue || 0,
    status: initialData?.status || "em_andamento"
  });
  
  const [photos, setPhotos] = useState<any[]>(initialData?.photos || []);
  const [isUploading, setIsUploading] = useState(false);

  const isTimeValid = () => {
    if (!formData.hora_inicial || !formData.hora_final) return false;
    return parseFloat(formData.hora_final) > parseFloat(formData.hora_inicial);
  };

  const handlePhotoUpload = () => {
    if (photos.length >= 5) return;
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      const newPhoto = { url: `painel_maq_${formData.machines.join('_')}_${photos.length + 1}.jpg`, label: "Foto do Painel" };
      setPhotos([...photos, newPhoto]);
    }, 1500);
  };

  const handleSave = () => {
    if (!isTimeValid()) return;
    if (!formData.client || formData.machines.length === 0 || !formData.operator) return;

    const start = parseFloat(formData.hora_inicial);
    const end = parseFloat(formData.hora_final);
    let hoursWorked = end - start;

    const cost_machine = formData.machines.reduce((total: number, machineName: string) => {
      const machineObj = mockMachines.find(m => m.name === machineName);
      return total + (hoursWorked * (machineObj?.hour_cost || 0));
    }, 0);

    const operatorObj = mockOperators.find(o => o.name === formData.operator);

    const cost_operator = hoursWorked * ((operatorObj?.salary || 0) / 220); // Basic rule, will be handled by dynamic rule engine later
    const cost_diesel = formData.dieselSupplier === 'sao_bento' ? ((formData.diesel || 0) * 6.50) : 0;

    const additionalCosts = [
      { id: `cst-${Date.now()}-1`, name: "Custo Máquina", value: cost_machine, createdAt: new Date().toISOString(), createdBy: "admin@saobento.com" },
      { id: `cst-${Date.now()}-2`, name: "Custo Operador", value: cost_operator, createdAt: new Date().toISOString(), createdBy: "admin@saobento.com" }
    ];

    if (cost_diesel > 0) {
      additionalCosts.push({ id: `cst-${Date.now()}-3`, name: "Custo Diesel (São Bento)", value: cost_diesel, createdAt: new Date().toISOString(), createdBy: "admin@saobento.com" });
    }

    const total_costs = additionalCosts.reduce((acc, curr) => acc + curr.value, 0);
    const totalRevenue = (formData.fixedValue || 0) + (hoursWorked * (formData.hourlyValue || 0));
    // If diesel is from Sao Bento, we might add it to the final invoice depending on config
    const profit = totalRevenue - total_costs;
    const serviceData = {
      ...formData,
      machine: formData.machines.join(', '),
      id: initialData?.id || `SRV-${1000 + mockServices.length + 1}`,
      hours: hoursWorked,
      freight: 0,
      notes: "",
      photos: photos,
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
      if (idx !== -1) mockServices[idx] = serviceData as any;
    } else {
      mockServices.unshift(serviceData as any);
    }

    // Gerar lançamentos financeiros de custo automaticamente
    additionalCosts.forEach(cost => {
      mockTransactions.unshift({
        id: `tx-${Date.now()}-${cost.name.replace(/\s/g, '')}-${Math.random().toString(36).substr(2, 5)}`,
        type: "saida",
        amount: cost.value,
        date: formData.date,
        description: `${cost.name} - ${serviceData.id} (${serviceData.machine})`,
        account: "Sicoob",
        category: cost.name.includes("Diesel") ? "Diesel" : "Manutenção/Operacional",
        supplier: "São Bento Logística", // Auto-supplier
        dueDate: formData.date,
        allocation: serviceData.machine,
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Tipo de Serviço</Label>
          <Input 
            placeholder="Ex: Destoca, Terraplanagem"
            value={formData.serviceType}
            onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
            className="h-11 rounded-xl border-border bg-muted/10" 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Equipamento / Máquina</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start h-11 rounded-xl border-border bg-muted/10 font-normal truncate">
                {formData.machines.length > 0 
                  ? formData.machines.join(', ')
                  : <span className="text-muted-foreground">Selecione as máquinas</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px] rounded-xl z-[100] border-border">
              {sortedMachines.map((m) => (
                <DropdownMenuCheckboxItem
                  key={m.id}
                  checked={formData.machines.includes(m.name)}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({
                      ...prev,
                      machines: checked 
                        ? [...prev.machines, m.name]
                        : prev.machines.filter((name: string) => name !== m.name)
                    }))
                  }}
                >
                  {m.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
            <SelectContent className="rounded-xl z-[100] border-border">
              {sortedOperators.map((o) => (
                <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Status da OS</Label>
          <Select 
            value={formData.status} 
            onValueChange={(v) => setFormData({...formData, status: v})}
          >
            <SelectTrigger className="h-11 rounded-xl border-border bg-muted/10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl z-[100] border-border">
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
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
            placeholder="1332.6"
            value={formData.hora_inicial} 
            onChange={(e) => setFormData({...formData, hora_inicial: e.target.value})} 
            className="h-11 rounded-xl border-border bg-muted/10 font-mono" 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Horímetro Final</Label>
          <Input 
            type="number" 
            step="0.1"
            placeholder="1338.0"
            value={formData.hora_final} 
            onChange={(e) => setFormData({...formData, hora_final: e.target.value})} 
            className={`h-11 rounded-xl border-border bg-muted/10 font-mono ${!isTimeValid() && formData.hora_final ? 'border-destructive text-destructive' : ''}`} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Fornec. Diesel</Label>
          <Select 
            value={formData.dieselSupplier} 
            onValueChange={(v) => setFormData({...formData, dieselSupplier: v})}
          >
            <SelectTrigger className="h-11 rounded-xl border-border bg-muted/10">
              <SelectValue placeholder="Fornecedor" />
            </SelectTrigger>
            <SelectContent className="rounded-xl z-[100] border-border">
              <SelectItem value="cliente">Cliente (Sem Custo)</SelectItem>
              <SelectItem value="sao_bento">São Bento</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Comprovante de Horímetro (Foto do Painel)</Label>
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
                Limite de 5 fotos atingido
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