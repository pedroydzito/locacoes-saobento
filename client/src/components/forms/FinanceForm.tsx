import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockAccounts, mockTransactions, mockMachines } from "@/lib/mock-data";

interface FinanceFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function FinanceForm({ onSave, onCancel, initialData }: FinanceFormProps) {
  const [formData, setFormData] = useState({
    type: initialData?.type || "entrada",
    date: initialData?.date || new Date().toISOString().split('T')[0],
    description: initialData?.description || "",
    category: initialData?.category || "",
    account: initialData?.account || "Sicoob",
    amount: initialData?.amount || "",
    supplier: initialData?.supplier || "",
    dueDate: initialData?.dueDate || "",
    allocation: initialData?.allocation || "Administrativo",
    invoiceNumber: initialData?.invoiceNumber || "",
    boletoInfo: initialData?.boletoInfo || {
      installment: "",
      isPaid: false,
      delayDays: 0,
      interestValue: 0
    }
  });

  const handleSave = () => {
    if (!formData.description || !formData.amount) return;

    const currentUser = (localStorage.getItem("userRole") === "admin") ? "admin@saobento.com" : "operador@saobento.com";
    const amount = parseFloat(formData.amount.toString());

    const finalData = { ...formData };
    if (finalData.account !== "Boletos Cobrança") {
      finalData.boletoInfo = undefined;
    }

    if (initialData?.id) {
      const index = mockTransactions.findIndex(t => t.id === initialData.id);
      if (index !== -1) {
        mockTransactions[index] = {
          ...mockTransactions[index],
          ...finalData,
          amount,
        };
      }
    } else {
      mockTransactions.unshift({
        id: `tx-${Date.now()}`,
        ...finalData,
        amount,
        createdAt: new Date().toISOString(),
        createdBy: currentUser,
        relatedCostId: undefined,
        relatedServiceId: undefined
      });
    }

    onSave();
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Tipo de Lançamento</Label>
          <Select 
            value={formData.type} 
            onValueChange={(v) => setFormData({...formData, type: v})}
          >
            <SelectTrigger className="h-11 rounded-xl border-border bg-muted/10">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              <SelectItem value="entrada" className="font-medium text-success-text">Entrada (+)</SelectItem>
              <SelectItem value="saida" className="font-medium text-destructive">Saída (-)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Data</Label>
          <Input 
            id="date" 
            type="date" 
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="h-11 rounded-xl border-border bg-muted/10 font-mono" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Descrição / Histórico</Label>
        <Input 
          id="description" 
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Ex: Pagamento de Diesel, Recebimento OS..." 
          className="h-11 rounded-xl border-border bg-muted/10" 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Categoria</Label>
          <Input 
            id="category" 
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            placeholder="Ex: Diesel, Manutenção, Venda..." 
            className="h-11 rounded-xl border-border bg-muted/10" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Conta de Origem/Destino</Label>
          <Select 
            value={formData.account}
            onValueChange={(v) => setFormData({...formData, account: v})}
          >
            <SelectTrigger className="h-11 rounded-xl border-border bg-muted/10">
              <SelectValue placeholder="Selecione a conta" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              {mockAccounts.map(acc => (
                <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.account === "Boletos Cobrança" && (
        <div className="p-4 rounded-xl border border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning-subtle))] space-y-4 mt-2 animate-in fade-in slide-in-from-top-2">
          <p className="text-xs font-bold text-[hsl(var(--warning-text))] flex items-center gap-2">
            Detalhes do Boleto
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase">Parcela (Ex: 1/12)</Label>
              <Input 
                value={formData.boletoInfo?.installment || ""} 
                onChange={(e) => setFormData({...formData, boletoInfo: {...formData.boletoInfo, installment: e.target.value}} as any)}
                placeholder="N/A"
                className="h-9 rounded-lg border-border bg-background" 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase">Status</Label>
              <Select 
                value={formData.boletoInfo?.isPaid ? "paid" : "pending"} 
                onValueChange={(v) => setFormData({...formData, boletoInfo: {...formData.boletoInfo, isPaid: v === "paid"}} as any)}
              >
                <SelectTrigger className="h-9 rounded-lg border-border bg-background"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending" className="text-[hsl(var(--warning))] font-bold">Pendente</SelectItem>
                  <SelectItem value="paid" className="text-[hsl(var(--success))] font-bold">Quitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase">Dias em Atraso</Label>
              <Input 
                type="number" 
                value={formData.boletoInfo?.delayDays || 0} 
                onChange={(e) => setFormData({...formData, boletoInfo: {...formData.boletoInfo, delayDays: Number(e.target.value)}} as any)}
                className="h-9 rounded-lg border-border bg-background" 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase">Juros/Multa (R$)</Label>
              <Input 
                type="number" 
                value={formData.boletoInfo?.interestValue || 0} 
                onChange={(e) => setFormData({...formData, boletoInfo: {...formData.boletoInfo, interestValue: Number(e.target.value)}} as any)}
                className="h-9 rounded-lg border-border bg-background" 
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplier" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Fornecedor / Cliente</Label>
          <Input 
            id="supplier" 
            value={formData.supplier}
            onChange={(e) => setFormData({...formData, supplier: e.target.value})}
            placeholder="Nome da empresa ou pessoa" 
            className="h-11 rounded-xl border-border bg-muted/10" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Nº Nota Fiscal (Opcional)</Label>
          <Input 
            id="invoiceNumber" 
            value={formData.invoiceNumber}
            onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
            placeholder="Ex: NF-10492" 
            className="h-11 rounded-xl border-border bg-muted/10 font-mono" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Valor Total (R$)</Label>
        <Input 
          id="amount" 
          type="number" 
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
          placeholder="0,00" 
          className="h-12 rounded-xl border-border bg-muted/10 font-mono text-xl font-bold text-primary focus-visible:ring-primary/20" 
        />
      </div>

      {formData.type === 'saida' && (
        <div className="space-y-5 pt-5 mt-2 border-t border-border/60 animate-in fade-in slide-in-from-top-2 duration-400">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Fornecedor / Loja</Label>
              <Input 
                id="supplier" 
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                placeholder="Ex: Posto Rodonave" 
                className="h-11 rounded-xl border-border bg-muted/10" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Data de Vencimento</Label>
              <Input 
                id="dueDate" 
                type="date" 
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="h-11 rounded-xl border-border bg-muted/10 font-mono" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="allocation" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Alocação de Custo (Destino)</Label>
            <Select 
              value={formData.allocation}
              onValueChange={(v) => setFormData({...formData, allocation: v})}
            >
              <SelectTrigger className="h-11 rounded-xl border-border bg-muted/10">
                <SelectValue placeholder="Selecione o destino" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border z-[100]">
                <SelectItem value="Administrativo" className="font-medium italic">Administrativo (Geral)</SelectItem>
                <SelectItem value="Oficina" className="font-medium italic">Oficina / Manutenção</SelectItem>
                <div className="h-px bg-border my-1" />
                {mockMachines.map(m => (
                  <SelectItem key={m.id} value={m.name}>Máquina: {m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground ml-1">Vincule esta despesa a uma máquina específica para relatórios de rentabilidade.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-border/60">
        <Button variant="outline" onClick={onCancel} className="h-11 rounded-xl flex-1 border-border hover:bg-muted/50 transition-colors">Cancelar</Button>
        <Button onClick={handleSave} className="h-11 rounded-xl font-bold flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-none transition-all active:scale-[0.98]">{initialData?.id ? 'Atualizar Lançamento' : 'Salvar no Financeiro'}</Button>
      </div>
    </div>
  );
}