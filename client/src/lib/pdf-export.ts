import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const exportServiceToPDF = (service: any, mockClients: any[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(29, 53, 87);
  doc.text("LOCAÇÕES SÃO BENTO", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Relatório de Serviço - OS ${service.id}`, 105, 28, { align: "center" });
  
  doc.setDrawColor(200);
  doc.line(20, 35, 190, 35);

  // Client Info
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text(`Cliente: ${service.client}`, 20, 45);
  
  const clientData = mockClients.find(c => c.name === service.client);
  if (clientData) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`CPF/CNPJ: ${clientData.cpf_cnpj || "N/A"}`, 20, 52);
  }
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Data do Serviço: ${new Date(service.date).toLocaleDateString('pt-BR')}`, 20, 59);
  doc.text(`Status: ${service.status === 'concluido' ? 'Concluído' : 'Em Andamento'}`, 20, 66);
  doc.text(`Safra: ${service.safra || '2023/24'}`, 120, 59);
  doc.text(`Máquinas: ${service.machine}`, 120, 66);
  doc.text(`Operador: ${service.operator}`, 120, 73);

  // Details Table
  autoTable(doc, {
    startY: 85,
    head: [['Detalhes da Operação', 'Informação']],
    body: [
      ['Tipo de Serviço', service.serviceType || "-"],
      ['Horímetro Inicial', service.hora_inicial?.toString() || "-"],
      ['Horímetro Final', service.hora_final?.toString() || "-"],
      ['Horas Totais', typeof service.hora_final === 'number' && typeof service.hora_inicial === 'number' ? (service.hora_final - service.hora_inicial).toFixed(1) + "h" : "-"],
      ['Diesel Utilizado', `${service.diesel || 0} L (${service.dieselSupplier === 'sao_bento' ? 'São Bento' : 'Cliente'})`]
    ],
    headStyles: { fillColor: [29, 53, 87], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    styles: { fontSize: 10, cellPadding: 5 },
    margin: { left: 20, right: 20 }
  });

  // Financial
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`VALOR TOTAL: R$ ${Number(service.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 190, finalY, { align: "right" });

  // Photos Section
  if (service.photos && service.photos.length > 0) {
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(29, 53, 87);
    doc.text("Anexos e Evidências", 105, 20, { align: "center" });
    doc.setDrawColor(200);
    doc.line(20, 25, 190, 25);

    let currentY = 35;
    service.photos.forEach((photo: any, index: number) => {
      const photoUrl = typeof photo === 'string' ? photo : photo.url;
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text(`Anexo ${index + 1}: ${photoUrl}`, 20, currentY);
      currentY += 10;
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Locações São Bento - Sistema ERP v1.5.0", 105, 285, { align: "center" });

  doc.save(`OS_${service.id}_${service.client.replace(/\s/g, '_')}.pdf`);
};
