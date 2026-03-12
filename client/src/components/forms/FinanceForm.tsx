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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select defaultValue={initialData?.type || "entrada"}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="saida">Saída</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input id="date" type="date" defaultValue={initialData?.date || new Date().toISOString().split('T')[0]} />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input id="description" defaultValue={initialData?.description} placeholder="Descrição do lançamento" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Input id="category" defaultValue={initialData?.category} placeholder="Ex: Serviços, Diesel..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account">Conta</Label>
          <Select defaultValue={initialData?.account || "Sicoob"}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sicoob">Sicoob</SelectItem>
              <SelectItem value="Banco do Brasil">Banco do Brasil</SelectItem>
              <SelectItem value="Dinheiro">Dinheiro</SelectItem>
              <SelectItem value="Boletos Cobrança">Boletos Cobrança</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Valor (R$)</Label>
        <Input id="amount" type="number" defaultValue={initialData?.amount} placeholder="0,00" />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSave}>{initialData?.id ? 'Atualizar Lançamento' : 'Salvar Lançamento'}</Button>
      </div>
    </div>
  );
}