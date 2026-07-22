import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockMachines, mockMechanics, mockMaintenanceRecords, mockTransactions, mockInventory, type MaintenanceRecord } from "@/lib/mock-data";
import { Plus, Trash2, Wrench } from "lucide-react";

interface MaintenanceFormProps {
  onSave: () => void;
  onCancel: () => void;
  machineId?: string;
}

export function MaintenanceForm({ onSave, onCancel, machineId }: MaintenanceFormProps) {
  const [selectedMachineId, setSelectedMachineId] = useState(machineId || mockMachines[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<MaintenanceRecord['type']>('revisao');
  const [mechanicType, setMechanicType] = useState<'interno' | 'externo'>('interno');
  const [mechanicId, setMechanicId] = useState(mockMechanics[0]?.id || "");
  const [externalMechanicName, setExternalMechanicName] = useState("");
  const [description, setDescription] = useState("");
  const [parts, setParts] = useState<{ code: string; name: string; quantity: number; unitPrice: number }[]>([]);

  const handleAddPart = () => {
    setParts(prev => [...prev, { code: "", name: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleRemovePart = (index: number) => {
    setParts(prev => prev.filter((_, i) => i !== index));
  };

  const handlePartChange = (index: number, field: string, value: any) => {
    setParts(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const totalPartsCost = parts.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);

  const handleSave = () => {
    const machineObj = mockMachines.find(m => m.id === selectedMachineId);
    if (!machineObj) return;

    const mechanicObj = mechanicType === 'interno' ? mockMechanics.find(m => m.id === mechanicId) : null;
    const mechanicName = mechanicType === 'interno' ? (mechanicObj?.name || 'Mecânico Interno') : (externalMechanicName || 'Mecânico Externo');

    const newRecord: MaintenanceRecord = {
      id: `maint-${Date.now()}`,
      machineId: machineObj.id,
      date,
      type,
      mechanicType,
      mechanicId: mechanicType === 'interno' ? mechanicId : undefined,
      mechanicName,
      description,
      partsUsed: parts,
      totalCost: totalPartsCost,
    };

    mockMaintenanceRecords.unshift(newRecord);

    // Deduct parts from inventory
    parts.forEach(p => {
      if (p.code) {
        const invIndex = mockInventory.findIndex(i => i.code.toLowerCase() === p.code.toLowerCase());
        if (invIndex !== -1) {
          mockInventory[invIndex].quantity -= p.quantity;
          if (mockInventory[invIndex].quantity < 0) mockInventory[invIndex].quantity = 0;
        }
      }
    });

    // If there is cost, automatically create financial entry
    if (totalPartsCost > 0) {
      mockTransactions.unshift({
        id: `tx-maint-${Date.now()}`,
        type: "saida",
        amount: totalPartsCost,
        date,
        description: `Manutenção (${type}) - ${machineObj.name}`,
        account: "Sicoob",
        category: "Manutenção/Operacional",
        supplier: mechanicName,
        dueDate: date,
        allocation: machineObj.name,
        createdAt: new Date().toISOString(),
        createdBy: "admin@saobento.com",
      });
    }

    onSave();
  };

  return (
    <div className="space-y-5 p-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Equipamento</Label>
          <Select value={selectedMachineId} onValueChange={setSelectedMachineId} disabled={!!machineId}>
            <SelectTrigger className="h-11 rounded-xl border-border bg-muted/10">
              <SelectValue placeholder="Selecione a máquina" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              {mockMachines.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Data da Manutenção</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-11 rounded-xl bg-muted/10" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Tipo de Manutenção</Label>
          <Select value={type} onValueChange={v => setType(v as any)}>
            <SelectTrigger className="h-11 rounded-xl border-border bg-muted/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              <SelectItem value="troca_oleo">Troca de Óleo</SelectItem>
              <SelectItem value="reparo">Reparo</SelectItem>
              <SelectItem value="revisao">Revisão Preventiva</SelectItem>
              <SelectItem value="filtro">Troca de Filtro</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Origem do Mecânico</Label>
          <Select value={mechanicType} onValueChange={v => setMechanicType(v as any)}>
            <SelectTrigger className="h-11 rounded-xl border-border bg-muted/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              <SelectItem value="interno">Mecânico Interno (Equipe)</SelectItem>
              <SelectItem value="externo">Mecânico Externo (Terceirizado)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {mechanicType === 'interno' ? (
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Mecânico Responsável</Label>
          <Select value={mechanicId} onValueChange={setMechanicId}>
            <SelectTrigger className="h-11 rounded-xl border-border bg-muted/10">
              <SelectValue placeholder="Selecione o mecânico" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              {mockMechanics.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name} ({m.specialization})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Nome do Mecânico / Oficina Externa</Label>
          <Input placeholder="Ex: Oficina Mecânica São José" value={externalMechanicName} onChange={e => setExternalMechanicName(e.target.value)} className="h-11 rounded-xl bg-muted/10" />
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Descrição do Serviço</Label>
        <Input placeholder="Descreva os procedimentos realizados..." value={description} onChange={e => setDescription(e.target.value)} className="h-11 rounded-xl bg-muted/10" />
      </div>

      {/* Peças Utilizadas */}
      <div className="space-y-3 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-primary" /> Peças e Insumos Utilizados
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddPart} className="rounded-xl text-xs h-8">
            <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Peça
          </Button>
        </div>

        {parts.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">Nenhuma peça adicionada.</p>
        ) : (
          <div className="space-y-2">
            {parts.map((part, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center bg-muted/20 p-2.5 rounded-xl border border-border/50">
                <Input placeholder="Código" value={part.code} onChange={e => handlePartChange(index, 'code', e.target.value)} className="col-span-3 h-9 text-xs rounded-lg font-mono" />
                <Input placeholder="Nome da Peça" value={part.name} onChange={e => handlePartChange(index, 'name', e.target.value)} className="col-span-4 h-9 text-xs rounded-lg" />
                <Input type="number" placeholder="Qtd" value={part.quantity} onChange={e => handlePartChange(index, 'quantity', parseFloat(e.target.value) || 0)} className="col-span-2 h-9 text-xs rounded-lg font-mono" />
                <Input type="number" step="0.01" placeholder="R$ Unit" value={part.unitPrice} onChange={e => handlePartChange(index, 'unitPrice', parseFloat(e.target.value) || 0)} className="col-span-2 h-9 text-xs rounded-lg font-mono" />
                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemovePart(index)} className="col-span-1 h-9 w-9 text-destructive hover:bg-destructive/10 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 text-sm font-bold">
              <span className="text-muted-foreground">Custo Total em Peças:</span>
              <span className="text-primary">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPartsCost)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onCancel} className="rounded-xl flex-1">Cancelar</Button>
        <Button onClick={handleSave} className="rounded-xl font-bold flex-1">Salvar Manutenção</Button>
      </div>
    </div>
  );
}
