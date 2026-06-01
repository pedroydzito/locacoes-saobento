import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { mockTransactions } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionModal } from "@/components/ui/action-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FinanceForm } from "@/components/forms/FinanceForm";
import { Edit, Trash2, ChevronRight, ArrowLeft, DollarSign, Calendar, Tag, Wallet, FileText, ArrowUpRight, ArrowDownRight, Clock, Building2, Banknote, AlertCircle, CheckCircle2 } from "lucide-react";

export default function FinanceDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/financeiro/:id");
  const transactionId = params?.id;
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const transaction = mockTransactions.find(t => t.id === transactionId) as any;

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground text-lg">Lançamento não encontrado.</p>
        <Button variant="outline" onClick={() => setLocation("/financeiro")} className="rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Financeiro
        </Button>
      </div>
    );
  }

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const isIncome = transaction.type === "entrada";
  const isOverdue = transaction.dueDate && new Date(transaction.dueDate) < new Date();
  
  return (
    <div className="space-y-6 pb-8" key={refreshKey}>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <button onClick={() => setLocation("/financeiro")} className="hover:text-primary transition-colors font-medium cursor-pointer">
          Financeiro
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-bold">{transaction.id}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/financeiro")}
            className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground sm:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isIncome ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
            {isIncome ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight">{transaction.description}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{new Date(transaction.date).toLocaleDateString('pt-BR')} · {transaction.account}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 ${isIncome ? 'bg-success/5 text-success border-success/20' : 'bg-destructive/5 text-destructive border-destructive/20'}`}>
            {isIncome ? 'Receita' : 'Despesa'}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}
            className="rounded-xl h-9 border-border hover:bg-primary/5 hover:text-primary shadow-none">
            <Edit className="w-4 h-4 mr-2" /> Editar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(true)}
            className="rounded-xl h-9 border-border text-destructive hover:bg-destructive/5 hover:text-destructive shadow-none">
            <Trash2 className="w-4 h-4 mr-2" /> Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: DollarSign, label: "Valor", value: formatCurrency(transaction.amount), cls: isIncome ? "text-success" : "text-destructive" },
          { icon: Calendar, label: "Data de Lançamento", value: new Date(transaction.date).toLocaleDateString('pt-BR'), cls: "" },
          { icon: Tag, label: "Categoria", value: transaction.category, cls: "" },
          { icon: Wallet, label: "Conta Vinculada", value: transaction.account, cls: "" },
        ].map(({ icon: Icon, label, value, cls }) => (
          <div key={label} className="p-4 rounded-2xl bg-muted/20 border border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
              <Icon className="w-3 h-3" /> {label}
            </p>
            <p className={`font-bold text-sm ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-4">
            <FileText className="w-3.5 h-3.5" /> Detalhes da Transação
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Fornecedor/Cliente:</span>
              <span className="font-bold text-sm">{transaction.supplier || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Tag className="w-3 h-3" /> Destino (Alocação):</span>
              <span className="font-bold text-sm">{transaction.allocation || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Clock className="w-3 h-3" /> Vencimento:</span>
              <div className="flex flex-col items-end">
                <span className="font-bold text-sm">{transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString('pt-BR') : "—"}</span>
                {isOverdue && <span className="text-[9px] font-bold text-destructive uppercase">Vencido</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-4">
            <Clock className="w-3.5 h-3.5" /> Informações de Sistema
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ID do Lançamento:</span>
              <span className="font-mono text-xs font-bold">{transaction.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Criado por:</span>
              <span className="font-bold text-sm">{transaction.createdBy || 'Sistema'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Criado em:</span>
              <span className="font-bold text-sm">{transaction.createdAt ? new Date(transaction.createdAt).toLocaleString('pt-BR') : "—"}</span>
            </div>
            {transaction.relatedServiceId && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                <span className="text-sm text-muted-foreground font-bold text-primary">OS Vinculada:</span>
                <span className="font-bold text-sm text-primary cursor-pointer hover:underline" onClick={() => setLocation(`/servicos/${transaction.relatedServiceId}`)}>{transaction.relatedServiceId}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {transaction.boletoInfo && (
        <div className={`p-5 rounded-2xl border flex flex-col gap-5 mt-4 ${transaction.boletoInfo.isPaid ? 'bg-success/5 border-success/20' : 'bg-[hsl(var(--warning-subtle))] border-[hsl(var(--warning)/0.3)]'}`}>
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <h4 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${transaction.boletoInfo.isPaid ? 'text-success' : 'text-[hsl(var(--warning))]'}`}>
              <Banknote className="w-4 h-4" /> Detalhes do Boleto
            </h4>
            <Badge variant="outline" className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 border-none ${transaction.boletoInfo.isPaid ? 'bg-success/10 text-success' : 'bg-[hsl(var(--warning))] text-white'}`}>
              {transaction.boletoInfo.isPaid ? "Quitado" : "Pendente"}
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Parcela</span>
              <p className="font-bold text-base">{transaction.boletoInfo.installment || "—"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Status Atual</span>
              <div className="flex items-center gap-1.5 font-bold text-base">
                {transaction.boletoInfo.isPaid ? <CheckCircle2 className="w-4 h-4 text-success" /> : <AlertCircle className="w-4 h-4 text-[hsl(var(--warning))]" />}
                <span className={transaction.boletoInfo.isPaid ? "text-success" : "text-[hsl(var(--warning))]"}>{transaction.boletoInfo.isPaid ? "Pago" : "Aguardando"}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Atraso</span>
              <p className={`font-bold text-base ${transaction.boletoInfo.delayDays > 0 ? 'text-destructive' : 'text-foreground'}`}>
                {transaction.boletoInfo.delayDays > 0 ? `${transaction.boletoInfo.delayDays} dias` : "Em dia"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Juros/Multa</span>
              <p className={`font-bold text-base ${transaction.boletoInfo.interestValue > 0 ? 'text-destructive' : 'text-foreground'}`}>
                {formatCurrency(transaction.boletoInfo.interestValue || 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      <ActionModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Editar ${isIncome ? 'Receita' : 'Despesa'}`}>
        <FinanceForm
          onSave={() => { setIsEditModalOpen(false); setRefreshKey(k => k + 1); }}
          onCancel={() => setIsEditModalOpen(false)}
          initialData={transaction}
        />
      </ActionModal>
      <ConfirmDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          const idx = mockTransactions.findIndex(t => t.id === transactionId);
          if (idx !== -1) mockTransactions.splice(idx, 1);
          setLocation("/financeiro");
        }} title="Excluir lançamento"
        description={`Tem certeza que deseja excluir o lançamento "${transaction.description}"?`} />
    </div>
  );
}
