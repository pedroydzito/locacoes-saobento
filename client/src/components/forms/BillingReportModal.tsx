import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockServices, mockClients } from "@/lib/mock-data";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText, Download, Loader2, CheckCircle2 } from "lucide-react";

interface BillingReportModalProps {
  onClose: () => void;
}

export function BillingReportModal({ onClose }: BillingReportModalProps) {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const pendingServices = mockServices.filter(s => 
    s.client === selectedClient && (s.status === "andamento" || s.status === "Em Andamento")
  );

  // Auto-select all when client changes
  useEffect(() => {
    setSelectedServiceIds(pendingServices.map(s => s.id));
  }, [selectedClient]);

  const selectedServices = pendingServices.filter(s => selectedServiceIds.includes(s.id));
  const totalAmount = selectedServices.reduce((acc, s) => acc + (s.value || 0), 0);

  const toggleService = (id: string) => {
    setSelectedServiceIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const generatePDF = () => {
    if (!selectedClient) return;
    setIsGenerating(true);

    // Simulate small delay for UX
    setTimeout(() => {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(29, 53, 87); // --primary approximation
      doc.text("LOCAÇÕES SÃO BENTO", 105, 20, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Relatório de Cobrança de Serviços", 105, 28, { align: "center" });
      
      doc.setDrawColor(200);
      doc.line(20, 35, 190, 35);

      // Client Info
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.text(`Cliente: ${selectedClient}`, 20, 45);
      
      const clientData = mockClients.find(c => c.name === selectedClient);
      if (clientData) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`CPF/CNPJ: ${clientData.cpf_cnpj || "N/A"}`, 20, 52);
        doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 20, 59);
      }

      // Table
      autoTable(doc, {
        startY: 70,
        head: [['Data', 'Máquina', 'Descrição', 'Horas', 'Valor (R$)']],
        body: selectedServices.map(s => [
          new Date(s.date).toLocaleDateString('pt-BR'),
          s.machine,
          s.notes || "Serviço de campo",
          s.hours?.toString() || "-",
          s.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || "0,00"
        ]),
        headStyles: { fillColor: [29, 53, 87], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: 20, right: 20 }
      });

      // Total
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL A COBRAR: R$ ${totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 190, finalY, { align: "right" });

      // Photos Section
      const allPhotos = selectedServices.flatMap(s => (s.photos || []).map(p => ({ ...p, machine: s.machine, date: s.date })));
      
      if (allPhotos.length > 0) {
        doc.addPage();
        doc.setFontSize(18);
        doc.setTextColor(29, 53, 87);
        doc.text("Evidências (Fotos)", 105, 20, { align: "center" });
        doc.setDrawColor(200);
        doc.line(20, 25, 190, 25);

        let currentY = 35;
        let currentX = 20;
        const imgWidth = 80;
        const imgHeight = 60;
        const margin = 10;

        allPhotos.forEach((photo, index) => {
          if (currentY + imgHeight + 20 > 280) {
            doc.addPage();
            currentY = 20;
          }

          try {
            // In a real app we'd need to ensure image is loaded/base64
            // For mock purposes we assume URL is accessible
            doc.addImage(photo.url, 'JPEG', currentX, currentY, imgWidth, imgHeight);
            
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.setFont("helvetica", "bold");
            doc.text(`${photo.label}`, currentX, currentY + imgHeight + 5);
            doc.setFont("helvetica", "normal");
            doc.text(`${photo.machine} - ${new Date(photo.date).toLocaleDateString('pt-BR')}`, currentX, currentY + imgHeight + 9);
          } catch (e) {
            console.error("Error adding image to PDF", e);
            doc.rect(currentX, currentY, imgWidth, imgHeight);
            doc.text("Imagem indisponível", currentX + 10, currentY + 30);
          }

          if (index % 2 === 0) {
            currentX = 20 + imgWidth + margin;
          } else {
            currentX = 20;
            currentY += imgHeight + 25;
          }
        });
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Locações São Bento - Sistema ERP v1.5.0", 105, 285, { align: "center" });

      doc.save(`Cobranca_${selectedClient.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="space-y-6 pt-2">
      <div className="space-y-2">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Selecione o Cliente</Label>
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger className="h-11 rounded-xl border-border bg-card">
            <SelectValue placeholder="Escolha um cliente para cobrar" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {[...mockClients].sort((a, b) => a.name.localeCompare(b.name)).map(c => (
              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedClient && (
        <div className="bg-muted/30 rounded-2xl border p-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Resumo da Cobrança</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{selectedServiceIds.length} de {pendingServices.length} serviços selecionados</p>
              </div>
            </div>
            {pendingServices.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-[10px] uppercase font-bold text-primary hover:bg-primary/10"
                onClick={() => {
                  if (selectedServiceIds.length === pendingServices.length) {
                    setSelectedServiceIds([]);
                  } else {
                    setSelectedServiceIds(pendingServices.map(s => s.id));
                  }
                }}
              >
                {selectedServiceIds.length === pendingServices.length ? "Desmarcar Todos" : "Selecionar Todos"}
              </Button>
            )}
          </div>

          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
            {pendingServices.map(s => (
              <div 
                key={s.id} 
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedServiceIds.includes(s.id) ? 'bg-primary/5 border-primary/20' : 'bg-card border-border/50 opacity-70'}`}
                onClick={() => toggleService(s.id)}
              >
                <Checkbox 
                  checked={selectedServiceIds.includes(s.id)} 
                  onCheckedChange={() => toggleService(s.id)}
                  id={`srv-${s.id}`}
                  className="rounded border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="font-bold text-sm truncate">{s.machine}</span>
                    <span className="font-mono font-bold text-sm">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.value || 0)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                    <span>{new Date(s.date).toLocaleDateString('pt-BR')}</span>
                    <span>•</span>
                    <span>{s.hours}h operadas</span>
                    <span>•</span>
                    <span className={s.status === 'concluido' ? 'text-[hsl(var(--success-text))]' : 'text-[hsl(var(--warning-text))]'}>
                      {s.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {pendingServices.length === 0 && (
              <div className="text-center py-8 px-4 border-2 border-dashed border-border rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-medium">Nenhum serviço pendente encontrado para este cliente.</p>
              </div>
            )}
          </div>

          {selectedServices.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Valor Total Selecionado</span>
              <span className="text-xl font-bold text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onClose} className="h-12 sm:h-11 rounded-xl flex-1 sm:flex-none border-border">
          Fechar
        </Button>
        <Button 
          disabled={!selectedClient || selectedServiceIds.length === 0 || isGenerating} 
          onClick={generatePDF}
          className="h-12 sm:h-11 rounded-xl font-bold flex-1 sm:flex-none gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-none border-none"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Gerando PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Gerar Relatório ({selectedServiceIds.length})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
