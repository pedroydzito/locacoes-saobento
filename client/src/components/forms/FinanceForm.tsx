import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FinanceFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function FinanceForm({ onSave, onCancel, initialData }: FinanceFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Tipo</Label>
          <Select defaultValue={initialData?.type || "entrada"}>
            <SelectTrigger className="h-11 sm:h-10 rounded-xl">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="entrada" className="font-medium text-[hsl(var(--success-text))]">Entrada (+)</SelectItem>
              <SelectItem value="saida" className="font-medium text-destructive">Saída (-)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Data</Label>
          <Input id="date" type="date" defaultValue={initialData?.date || new Date().toISOString().split('T')[0]} className="h-11 sm:h-10 rounded-xl font-mono" />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Descrição</Label>
        <Input id="description" defaultValue={initialData?.description} placeholder="Descrição do lançamento" className="h-11 sm:h-10 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Categoria</Label>
          <Input id="category" defaultValue={initialData?.category} placeholder="Ex: Serviços, Diesel..." className="h-11 sm:h-10 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Conta</Label>
          <Select defaultValue={initialData?.account || "Sicoob"}>
            <SelectTrigger className="h-11 sm:h-10 rounded-xl">
              <SelectValue placeholder="Selecione a conta" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="Sicoob">Sicoob</SelectItem>
              <SelectItem value="Banco do Brasil">Banco do Brasil</SelectItem>
              <SelectItem value="Dinheiro">Dinheiro</SelectItem>
              <SelectItem value="Boletos Cobrança">Boletos Cobrança</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Valor (R$)</Label>
        <Input id="amount" type="number" defaultValue={initialData?.amount} placeholder="0,00" className="h-11 sm:h-10 rounded-xl font-mono text-lg font-bold" />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 sm:mt-6 pt-4 border-t border-border/50">
        <Button variant="outline" onClick={onCancel} className="h-12 sm:h-10 rounded-xl flex-1 sm:flex-none">Cancelar</Button>
        <Button onClick={onSave} className="h-12 sm:h-10 rounded-xl font-bold flex-1 sm:flex-none">{initialData?.id ? 'Atualizar' : 'Salvar Lançamento'}</Button>
      </div>
    </div>
  );
}