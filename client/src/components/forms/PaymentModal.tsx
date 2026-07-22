import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { mockAccounts, mockTransactions } from "@/lib/mock-data";
import { DollarSign, CheckCircle2 } from "lucide-react";

interface PaymentModalProps {
  transaction: any;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PaymentModal({ transaction, onConfirm, onCancel }: PaymentModalProps) {
  const [paidAmount, setPaidAmount] = useState<number>(transaction.amount);
  const [paidDate, setPaidDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [account, setAccount] = useState<string>(transaction.account || mockAccounts[0]?.name || "Sicoob");
  const [hasInterest, setHasInterest] = useState<boolean>(false);
  const [interestAmount, setInterestAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleSave = () => {
    const isPartial = paidAmount < transaction.amount;
    const finalPaid = paidAmount + (hasInterest ? interestAmount : 0);

    const idx = mockTransactions.findIndex(t => t.id === transaction.id);
    if (idx !== -1) {
      mockTransactions[idx] = {
        ...mockTransactions[idx],
        paymentStatus: isPartial ? "pago_parcial" : "pago",
        paidAmount: finalPaid,
        paidDate,
        interestAmount: hasInterest ? interestAmount : 0,
        account,
        notes: notes ? `${transaction.notes || ''} [Pagamento: ${notes}]` : transaction.notes,
      };

      // If partial payment, create a new pending transaction for remaining balance
      if (isPartial) {
        const remaining = transaction.amount - paidAmount;
        mockTransactions.unshift({
          ...transaction,
          id: `tx-${Date.now()}-restante`,
          amount: remaining,
          description: `${transaction.description} (Restante Parcial)`,
          paymentStatus: "pendente",
          paidAmount: undefined,
          paidDate: undefined,
        });
      }
    }

    onConfirm();
  };

  return (
    <div className="space-y-4 p-1">
      <div className="bg-muted/20 p-3 rounded-xl border border-border/50">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Lançamento Origem</p>
        <p className="font-bold text-sm text-foreground mt-0.5">{transaction.description}</p>
        <p className="text-sm font-bold text-primary mt-1 font-mono">{formatCurrency(transaction.amount)}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Valor Pago (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={paidAmount}
            onChange={e => setPaidAmount(parseFloat(e.target.value) || 0)}
            className="h-11 rounded-xl font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Data do Pagamento</Label>
          <Input
            type="date"
            value={paidDate}
            onChange={e => setPaidDate(e.target.value)}
            className="h-11 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Conta Bancária</Label>
        <Select value={account} onValueChange={setAccount}>
          <SelectTrigger className="h-11 rounded-xl bg-background border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {mockAccounts.map(acc => (
              <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 pt-2 border-t border-border/40">
        <div className="flex items-center space-x-2">
          <Checkbox id="interest" checked={hasInterest} onCheckedChange={(checked) => setHasInterest(!!checked)} />
          <label htmlFor="interest" className="text-xs font-bold cursor-pointer select-none">
            Teve juros ou multa no pagamento?
          </label>
        </div>

        {hasInterest && (
          <div className="space-y-2 animate-in fade-in">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Valor dos Juros/Multa (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={interestAmount}
              onChange={e => setInterestAmount(parseFloat(e.target.value) || 0)}
              className="h-11 rounded-xl font-mono text-destructive"
              placeholder="0,00"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onCancel} className="h-11 rounded-xl flex-1">Cancelar</Button>
        <Button onClick={handleSave} className="h-11 rounded-xl font-bold flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
          <CheckCircle2 className="w-4 h-4 mr-2" /> Confirmar Pagamento
        </Button>
      </div>
    </div>
  );
}
