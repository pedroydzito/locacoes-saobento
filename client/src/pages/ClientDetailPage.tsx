import { useLocation, useRoute } from "wouter";
import { useState, useMemo } from "react";
import { mockClients, mockServices } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionModal } from "@/components/ui/action-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ClientForm } from "@/components/forms/ClientForm";
import { Edit, Trash2, ChevronRight, ArrowLeft, User, Phone, Mail, MapPin, DollarSign, CalendarDays, FileText, FileDown, Loader2, ExternalLink, BarChart3 } from "lucide-react";
import { exportClientToPDF } from "@/lib/pdf-export";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis } from "recharts";

export default function ClientDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/clientes/:id");
  const clientId = params?.id;
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfStartDate, setPdfStartDate] = useState("");
  const [pdfEndDate, setPdfEndDate] = useState("");

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

  // Chart data: monthly revenue over last 12 months
  const now = new Date();
  const chartData = useMemo(() => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 6 + i, 1);
      const m = d.getMonth(), y = d.getFullYear();
      const svcs = clientServices.filter(s => {
        const sd = new Date(s.date + "T12:00:00");
        return sd.getMonth() === m && sd.getFullYear() === y;
      });
      return {
        label: months[m],
        revenue: svcs.reduce((a, s) => a + (s.value || 0), 0),
        hours: svcs.reduce((a, s) => a + (s.hours || 0), 0),
        count: svcs.length,
        isCurrent: i === 6
      };
    });
  }, [clientServices]);

  // Scatter Chart data: timeline of services
  const scatterData = useMemo(() => {
    return clientServices.map(s => {
      const d = new Date(s.date + "T12:00:00");
      return {
        id: s.id,
        date: d.getTime(), // timestamp for X axis
        dateStr: d.toLocaleDateString('pt-BR'),
        value: s.value || 0,
        hours: s.hours || 0,
        machine: s.machine,
        operator: s.operator,
        status: s.status
      };
    }).sort((a, b) => a.date - b.date);
  }, [clientServices]);

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
          <Button variant="outline" size="sm" onClick={() => setIsPDFModalOpen(true)}
            className="rounded-xl h-9 border-border hover:bg-primary/5 hover:text-primary shadow-none">
            <FileDown className="w-4 h-4 mr-2" /> Exportar PDF
          </Button>
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

      {/* Service Timeline Chart */}
      <Card className="border-border rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm">Faturamento (Últimos 7 meses)</h3>
        </div>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} width={50} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: 12 }}
                formatter={(v: any, name: string) => [formatCurrency(v as number), 'Faturamento']}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={36}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.isCurrent ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.4)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Service Timeline ScatterChart */}
      {scatterData.length > 0 && (
        <Card className="border-border rounded-2xl p-5">
          <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm">Timeline de Serviços</h3>
            </div>
            <p className="text-xs text-muted-foreground">Distribuição ao longo do tempo (Valor e Horas)</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  type="number" 
                  domain={['dataMin', 'dataMax']} 
                  tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
                />
                <YAxis 
                  dataKey="value" 
                  name="Valor" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} 
                  tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} 
                  width={50} 
                />
                <ZAxis dataKey="hours" range={[50, 400]} name="Horas" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3', stroke: 'hsl(var(--border))' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: 12, padding: '10px' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border shadow-md rounded-xl p-3 text-popover-foreground">
                          <p className="font-bold mb-1 border-b border-border/50 pb-1">{data.dateStr} - {data.id}</p>
                          <p className="text-sm"><span className="text-muted-foreground">Valor:</span> {formatCurrency(data.value)}</p>
                          <p className="text-sm"><span className="text-muted-foreground">Horas:</span> {data.hours}h</p>
                          <p className="text-sm"><span className="text-muted-foreground">Máquina:</span> {data.machine}</p>
                          <p className="text-sm"><span className="text-muted-foreground">Operador:</span> {data.operator}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={scatterData} fill="hsl(var(--primary))">
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.status === 'concluido' ? 'hsl(var(--primary))' : 'hsl(var(--warning))'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

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
                  <div key={s.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors cursor-pointer group" onClick={() => setLocation(`/servicos/${s.id}`)}>
                    <div>
                      <p className="font-bold text-sm text-primary">{s.id}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.machine} · {s.operator} · {new Date(s.date).toLocaleDateString('pt-BR')}</p>
                      {(s.area || s.serviceType) && <p className="text-xs text-muted-foreground">{s.area || s.serviceType}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatCurrency(s.value || 0)}</p>
                        <Badge variant="outline" className={`text-[9px] font-bold mt-1 ${s.status === 'concluido' ? 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-700 bg-amber-500/10 border-amber-500/20'}`}>
                          {s.status === 'concluido' ? 'Concluído' : 'Em andamento'}
                        </Badge>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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

      {/* PDF Export Modal */}
      <ActionModal isOpen={isPDFModalOpen} onClose={() => setIsPDFModalOpen(false)} title="Exportar Relatório PDF">
        <div className="space-y-5 p-1">
          <p className="text-sm text-muted-foreground">Gere um relatório completo deste cliente. Filtre por período para cobrir meses, anos ou intervalos personalizados.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Data Inicial</label>
              <Input type="date" className="rounded-xl" value={pdfStartDate} onChange={e => setPdfStartDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Data Final</label>
              <Input type="date" className="rounded-xl" value={pdfEndDate} onChange={e => setPdfEndDate(e.target.value)} />
            </div>
          </div>
          {(pdfStartDate || pdfEndDate) && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
              <p className="text-xs text-primary font-medium">
                Período selecionado: {pdfStartDate ? new Date(pdfStartDate + 'T00:00').toLocaleDateString('pt-BR') : 'início'} até {pdfEndDate ? new Date(pdfEndDate + 'T00:00').toLocaleDateString('pt-BR') : 'hoje'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {clientServices.filter(s => (!pdfStartDate || s.date >= pdfStartDate) && (!pdfEndDate || s.date <= pdfEndDate)).length} serviços encontrados no período.
              </p>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsPDFModalOpen(false)}>Cancelar</Button>
            <Button
              className="flex-1 rounded-xl"
              disabled={isGeneratingPDF}
              onClick={async () => {
                setIsGeneratingPDF(true);
                try {
                  await exportClientToPDF(client, clientServices, { startDate: pdfStartDate || undefined, endDate: pdfEndDate || undefined });
                } finally {
                  setIsGeneratingPDF(false);
                  setIsPDFModalOpen(false);
                }
              }}>
              {isGeneratingPDF ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</> : <><FileDown className="w-4 h-4 mr-2" /> Exportar PDF</>}
            </Button>
          </div>
        </div>
      </ActionModal>
    </div>
  );
}
