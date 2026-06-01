import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockMachines } from "@/lib/mock-data";

interface OperatorFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function OperatorForm({ onSave, onCancel, initialData }: OperatorFormProps) {
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const sortedMachines = [...mockMachines].map(m => m.name).sort();

  useEffect(() => {
    if (initialData?.machine_assigned) {
      if (Array.isArray(initialData.machine_assigned)) {
        setSelectedMachines(initialData.machine_assigned);
      } else if (typeof initialData.machine_assigned === 'string') {
        setSelectedMachines([initialData.machine_assigned]);
      }
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    onSave({
      ...data,
      machine_assigned: selectedMachines,
      salary: Number(data.salary) || 0,
      commission_per_hour: Number(data.commission_per_hour) || 0,
      fixed_commission: Number(data.fixed_commission) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Nome do Operador</Label>
        <Input id="name" name="name" defaultValue={initialData?.name} placeholder="Nome completo" className="h-11 sm:h-10 rounded-xl" required />
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Máquinas Designadas</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 sm:h-10 rounded-xl w-full justify-start text-left font-normal bg-card overflow-hidden">
                <span className="truncate">
                  {selectedMachines.length === 0 ? "Selecione as máquinas" : 
                   selectedMachines.length === 1 ? selectedMachines[0] : 
                   `${selectedMachines.length} máquina(s) selecionada(s)`}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <ScrollArea className="h-60">
                {sortedMachines.map(machine => (
                  <DropdownMenuCheckboxItem
                    key={machine}
                    checked={selectedMachines.includes(machine)}
                    onCheckedChange={(checked) => {
                      setSelectedMachines(prev =>
                        checked ? [...prev, machine] : prev.filter(m => m !== machine)
                      )
                    }}
                  >
                    {machine}
                  </DropdownMenuCheckboxItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="pt-4 mt-2 border-t border-border/50 space-y-4">
        <h3 className="text-sm font-bold text-foreground">Regras de Remuneração</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="salary" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Salário Fixo Mensal (R$)</Label>
            <Input id="salary" name="salary" type="number" defaultValue={initialData?.salary} placeholder="0,00" className="h-11 sm:h-10 rounded-xl font-mono" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commission_per_hour" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Comissão por Hora (R$)</Label>
              <Input id="commission_per_hour" name="commission_per_hour" type="number" defaultValue={initialData?.commission_per_hour} placeholder="0,00" className="h-11 sm:h-10 rounded-xl font-mono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fixed_commission" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Comissão Fixo p/ Serviço (R$)</Label>
              <Input id="fixed_commission" name="fixed_commission" type="number" defaultValue={initialData?.fixed_commission} placeholder="0,00" className="h-11 sm:h-10 rounded-xl font-mono" />
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          * Vales e adiantamentos devem ser lançados diretamente no módulo Financeiro, vinculados ao operador.
        </p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 sm:mt-6 pt-4 border-t border-border/50">
        <Button type="button" variant="outline" onClick={onCancel} className="h-12 sm:h-10 rounded-xl flex-1 sm:flex-none">Cancelar</Button>
        <Button type="submit" className="h-12 sm:h-10 rounded-xl font-bold flex-1 sm:flex-none">{initialData ? 'Atualizar' : 'Cadastrar Operador'}</Button>
      </div>
    </form>
  );
}