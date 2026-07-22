import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentDetails } from "@/lib/mock-data";
import { Checkbox } from "@/components/ui/checkbox";

interface ConcludeServiceModalProps {
  service: any;
  onConfirm: (paymentDetails: PaymentDetails) => void;
  onCancel: () => void;
}

export function ConcludeServiceModal({ service, onConfirm, onCancel }: ConcludeServiceModalProps) {
  const isFixed = (service.fixedValue || 0) > 0;
  const initialTotal = isFixed ? service.fixedValue : (service.hours || 0) * (service.hourlyValue || 0);

  const [paymentMethod, setPaymentMethod] = useState<PaymentDetails['paymentMethod']>("boleto");
  const [hasEntry, setHasEntry] = useState(false);
  const [entryAmount, setEntryAmount] = useState<number>(0);
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState<number>(1);

  const totalAmount = initialTotal + (service.freight || 0);
  const remainingAmount = totalAmount - (hasEntry ? entryAmount : 0);
  const installmentValue = isInstallment && installmentCount > 0 ? remainingAmount / installmentCount : remainingAmount;

  const handleConfirm = () => {
    const paymentDetails: PaymentDetails = {
      paymentMethod,
      entryAmount: hasEntry ? entryAmount : undefined,
      remainingAmount: remainingAmount,
      isInstallment,
      installmentCount: isInstallment ? installmentCount : undefined,
      installmentValue: isInstallment ? installmentValue : undefined,
      hourlyRate: service.hourlyValue,
      totalHours: service.hours,
    };
    onConfirm(paymentDetails);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-3">
        <h3 className="text-sm font-bold text-foreground">Resumo da Obra</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Total de Horas</p>
            <p className="font-medium text-foreground">{service.hours?.toFixed(1) || '0'}h</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">{isFixed ? 'Valor Fixo' : 'Valor Hora'}</p>
            <p className="font-medium text-primary">{formatCurrency(isFixed ? service.fixedValue : service.hourlyValue)}</p>
          </div>
          <div className="col-span-2 pt-2 border-t border-border">
            <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Valor Total a Pagar</p>
            <p className="font-bold text-xl text-primary">{formatCurrency(totalAmount)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Forma de Pagamento</Label>
          <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
            <SelectTrigger className="h-11 rounded-xl bg-muted/10 border-border">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="boleto">Boleto Bancário</SelectItem>
              <SelectItem value="cartao">Cartão</SelectItem>
              <SelectItem value="transferencia">Transferência TED/DOC</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="hasEntry" 
            checked={hasEntry} 
            onCheckedChange={(checked) => {
              setHasEntry(checked as boolean);
              if (!checked) setEntryAmount(0);
            }} 
          />
          <Label htmlFor="hasEntry" className="text-sm font-medium">Cliente deu valor de entrada?</Label>
        </div>

        {hasEntry && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Valor da Entrada (R$)</Label>
            <Input 
              type="number" 
              value={entryAmount || ''} 
              onChange={(e) => setEntryAmount(parseFloat(e.target.value) || 0)}
              className="h-11 rounded-xl bg-muted/10 border-border font-mono text-primary"
              placeholder="0.00"
            />
          </div>
        )}

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox 
            id="isInstallment" 
            checked={isInstallment} 
            onCheckedChange={(checked) => setIsInstallment(checked as boolean)} 
          />
          <Label htmlFor="isInstallment" className="text-sm font-medium">Parcelar valor restante?</Label>
        </div>

        {isInstallment && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nº Parcelas</Label>
              <Input 
                type="number" 
                value={installmentCount || ''} 
                onChange={(e) => setInstallmentCount(parseInt(e.target.value) || 1)}
                className="h-11 rounded-xl bg-muted/10 border-border"
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Valor da Parcela</Label>
              <div className="h-11 flex items-center px-3 rounded-xl bg-muted/30 border border-border font-mono text-sm text-foreground">
                {formatCurrency(installmentValue)}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex justify-between items-center mt-2">
          <span className="text-sm font-bold text-primary">Valor Restante:</span>
          <span className="text-xl font-bold text-primary">{formatCurrency(remainingAmount)}</span>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-border">
        <Button variant="outline" onClick={onCancel} className="h-11 rounded-xl flex-1 border-border">
          Cancelar
        </Button>
        <Button onClick={handleConfirm} className="h-11 rounded-xl flex-1 bg-primary text-primary-foreground font-bold">
          Confirmar Conclusão
        </Button>
      </div>
    </div>
  );
}
