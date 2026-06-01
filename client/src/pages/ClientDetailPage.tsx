import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { mockClients, mockServices } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionModal } from "@/components/ui/action-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ClientForm } from "@/components/forms/ClientForm";
import { Edit, Trash2, ChevronRight, ArrowLeft, User, Phone, Mail, MapPin, DollarSign, CalendarDays, FileText } from "lucide-react";

export default function ClientDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/clientes/:id");
  const clientId = params?.id;
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const client = mockClients.find(c => c.id === clientId) as any;

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground text-lg">Cliente não encontrado.</p>
        <Button variant="outline" onClick={() => setLocation("/clientes")} className="rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Clientes
        </Button>
      </div>
    );
  }

  const clientServices = mockServices.filter(s => s.client === client.name);
  const totalBilled = clientServices.reduce((acc, s) => acc + (s.value || 0), 0);
  const totalProfit = clientServices.reduce((acc, s) => acc + (s.profit || 0), 0);
  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const initials = client.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="space-y-6 pb-8" key={refreshKey}>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <button onClick={() => setLocation("/clientes")} className="hover:text-primary transition-colors font-medium cursor-pointer">
          Clientes
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-bold">{client.name}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/clientes")}
            className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground sm:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">{initials}</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight">{client.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{client.city} · {clientServices.length} serviços</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: FileText, label: "Total de OSs", value: `${clientServices.length}` },
          { icon: DollarSign, label: "Total Faturado", value: formatCurrency(totalBilled) },
          { icon: DollarSign, label: "Lucro Gerado", value: formatCurrency(totalProfit) },
          { icon: CalendarDays, label: "Último Serviço", value: clientServices.length ? new Date(clientServices[0].date).toLocaleDateString('pt-BR') : "—" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="p-4 rounded-2xl bg-muted/20 border border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
              <Icon className="w-3 h-3" /> {label}
            </p>
            <p className="font-bold text-sm font-mono">{value}</p>
          </div>
        ))}
      </div>

      {/* Contact & Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-4">
            <User className="w-3.5 h-3.5" /> Dados do Cliente
          </p>
          <div className="space-y-3">
            {[
              { icon: Phone, label: "Telefone", value: client.phone },
              { icon: Mail, label: "E-mail", value: client.email },
              { icon: MapPin, label: "Cidade", value: client.city },
              { icon: FileText, label: "CPF/CNPJ", value: client.cpf_cnpj },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Icon className="w-3 h-3" />{label}:</span>
                <span className="font-bold text-sm text-right truncate max-w-[180px]">{value}</span>
              </div>
            ))}
          </div>
          {client.notes && (
            <div className="mt-4 pt-3 border-t border-border/50">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Observações</p>
              <p className="text-sm text-muted-foreground">{client.notes}</p>
            </div>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-4">
            <DollarSign className="w-3.5 h-3.5" /> Resumo Financeiro
          </p>
          <div className="space-y-3">
            {[
              ["Total Faturado", formatCurrency(totalBilled)],
              ["Lucro Gerado", formatCurrency(totalProfit)],
              ["Serviços Concluídos", clientServices.filter(s => s.status === 'concluido').length],
              ["Serviços Em Andamento", clientServices.filter(s => s.status !== 'concluido').length],
              ["Ticket Médio", clientServices.length ? formatCurrency(totalBilled / clientServices.length) : "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{k}:</span>
                <span className="font-bold text-sm">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {clientServices.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
            <CalendarDays className="w-3 h-3" /> Serviços do Cliente
          </h4>
          <Card className="rounded-2xl border border-border bg-card overflow-hidden shadow-none">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {clientServices.slice(0, 10).map(s => (
                  <div key={s.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="font-bold text-sm text-primary">{s.id}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.machine} · {s.operator} · {new Date(s.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(s.value || 0)}</p>
                      <Badge variant="outline" className={`text-[9px] font-bold mt-1 ${s.status === 'concluido' ? 'text-[hsl(var(--success-text))] bg-[hsl(var(--success-subtle))]' : 'text-[hsl(var(--warning-text))] bg-[hsl(var(--warning-subtle))]'}`}>
                        {s.status === 'concluido' ? 'Concluído' : 'Em andamento'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ActionModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Cliente">
        <ClientForm onSave={() => { setIsEditModalOpen(false); setRefreshKey(k => k + 1); }} onCancel={() => setIsEditModalOpen(false)} initialData={client} />
      </ActionModal>
      <ConfirmDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          const idx = mockClients.findIndex(c => c.id === clientId);
          if (idx !== -1) mockClients.splice(idx, 1);
          setLocation("/clientes");
        }} title="Excluir cliente"
        description={`Tem certeza que deseja excluir "${client.name}"?`} />
    </div>
  );
}
