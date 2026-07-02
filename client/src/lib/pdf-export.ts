import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const COMPANY_NAME = "SÃO BENTO LOCAÇÕES E SERVIÇOS LTDA - ME";
const COMPANY_CNPJ = "44.459.342/0001-40";
const PRIMARY_COLOR: [number, number, number] = [29, 53, 87];
const FOOTER_TEXT = "São Bento Locações - Sistema ERP v1.5.0";

let logoBase64Cache: string | null = null;

export async function loadLogoForPDF(): Promise<string | null> {
  if (logoBase64Cache) return logoBase64Cache;
  try {
    const response = await fetch("/logo-color.png");
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        logoBase64Cache = reader.result as string;
        resolve(logoBase64Cache);
      };
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function addHeader(doc: jsPDF, subtitle: string, logoData?: string | null) {
  const hasLogo = !!logoData;
  const textX = hasLogo ? 45 : 105;
  const textAlign = hasLogo ? "left" : "center";

  // Logo
  if (hasLogo) {
    try {
      doc.addImage(logoData, "PNG", 15, 8, 25, 25);
    } catch {
      // If logo fails, continue without it
    }
  }

  // Company name
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(COMPANY_NAME, textX, 16, { align: textAlign as any });

  // CNPJ
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`CNPJ: ${COMPANY_CNPJ}`, textX, 23, { align: textAlign as any });

  // Subtitle
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(subtitle, textX, 30, { align: textAlign as any });

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(15, 36, 195, 36);
}

function addFooter(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(FOOTER_TEXT, 105, 285, { align: "center" });
    doc.text(`Página ${i} de ${pageCount}`, 190, 285, { align: "right" });
    doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, 20, 285);
  }
}

export interface ServicePDFSections {
  header: boolean;
  clientInfo: boolean;
  operationDetails: boolean;
  financial: boolean;
  dieselInfo: boolean;
  photos: boolean;
}

export const exportServiceToPDF = async (service: any, mockClients: any[], sections?: ServicePDFSections) => {
  const s: ServicePDFSections = sections ?? {
    header: true,
    clientInfo: true,
    operationDetails: true,
    financial: true,
    dieselInfo: true,
    photos: true
  };

  const logoData = await loadLogoForPDF();
  const doc = new jsPDF();
  addHeader(doc, `Relatório de Serviço — OS ${service.id}`, logoData);

  let y = 45;

  // Client Info
  if (s.clientInfo) {
    const clientData = mockClients.find((c: any) => c.name === service.client);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Cliente: ${service.client}`, 20, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    if (clientData?.cpf_cnpj) {
      doc.text(`CPF/CNPJ: ${clientData.cpf_cnpj}`, 20, y);
      y += 6;
    }
    if (clientData?.phone) {
      doc.text(`Telefone: ${clientData.phone}`, 20, y);
      y += 6;
    }
    if (clientData?.address) {
      doc.text(`Endereço: ${clientData.address}`, 20, y);
      y += 6;
    }
    y += 4;
  }

  // Operation Quick Info
  if (s.operationDetails) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);

    const hTotal =
      typeof service.hora_final === "number" && typeof service.hora_inicial === "number"
        ? (service.hora_final - service.hora_inicial).toFixed(1) + "h"
        : "-";

    const leftCol = [
      [`Data do Serviço:`, new Date(service.date).toLocaleDateString("pt-BR")],
      [`Status:`, service.status === "concluido" ? "Concluído" : "Em Andamento"],
      [`Tipo de Serviço:`, service.serviceType || "-"],
    ];
    const rightCol = [
      [`Máquina(s):`, service.machine],
      [`Operador:`, service.operator],
      [`OS N°:`, service.id],
    ];

    leftCol.forEach(([label, value], i) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 20, y + i * 6);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), 65, y + i * 6);
    });
    rightCol.forEach(([label, value], i) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 110, y + i * 6);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), 145, y + i * 6);
    });
    y += leftCol.length * 6 + 8;

    // Horímetro table
    autoTable(doc, {
      startY: y,
      head: [["Horímetro Inicial", "Horímetro Final", "Total de Horas Trabalhadas"]],
      body: [[
        service.hora_inicial ?? "-",
        service.hora_final ?? "-",
        hTotal,
      ]],
      headStyles: { fillColor: PRIMARY_COLOR, textColor: 255, fontStyle: "bold", fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 4, halign: "center" },
      margin: { left: 20, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // Diesel Info
  if (s.dieselInfo) {
    autoTable(doc, {
      startY: y,
      head: [["Combustível / Diesel", "Quantidade", "Fornecedor"]],
      body: [[
        "Óleo Diesel",
        `${service.diesel ?? 0} L`,
        service.dieselSupplier === "sao_bento" ? "São Bento Locações" : "Cliente",
      ]],
      headStyles: { fillColor: [80, 120, 60], textColor: 255, fontStyle: "bold", fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 248, 245] },
      styles: { fontSize: 9, cellPadding: 4, halign: "center" },
      margin: { left: 20, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // Financial
  if (s.financial) {
    const costs = service.costs || { machine: 0, operator: 0, diesel: 0 };
    const totalCosts = (costs.machine || 0) + (costs.operator || 0) + (costs.diesel || 0);
    const profit = (service.value || 0) - totalCosts;
    const margin = service.value > 0 ? ((profit / service.value) * 100).toFixed(1) : "0.0";

    autoTable(doc, {
      startY: y,
      head: [["Detalhamento Financeiro", "Valor"]],
      body: [
        ["Faturamento (Receita Bruta)", `R$ ${Number(service.value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
        ["Custo Operacional — Máquina", `R$ ${Number(costs.machine || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
        ["Custo de Operador", `R$ ${Number(costs.operator || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
        ["Custo de Combustível", `R$ ${Number(costs.diesel || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
        ["Total de Custos", `R$ ${totalCosts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
        [`Lucro Líquido (Margem: ${margin}%)`, `R$ ${profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
      ],
      headStyles: { fillColor: PRIMARY_COLOR, textColor: 255, fontStyle: "bold", fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
      margin: { left: 20, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // Photos
  if (s.photos && service.photos && service.photos.length > 0) {
    doc.addPage();
    addHeader(doc, `Anexos e Evidências — OS ${service.id}`, logoData);
    let photoY = 45;
    service.photos.forEach((photo: any, idx: number) => {
      const name = typeof photo === "string" ? photo : photo.url;
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(`Anexo ${idx + 1}: ${name}`, 20, photoY);
      photoY += 8;
    });
  }

  addFooter(doc);
  doc.save(`OS_${service.id}_${service.client.replace(/\s/g, "_")}.pdf`);
};

// ─────────────────────────────────────────────────────────────────────────────
// MACHINE PDF EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export interface MachinePDFSections {
  basicInfo: boolean;
  financial: boolean;
  financing: boolean;
  servicesHistory: boolean;
}

export const exportMachineToPDF = async (machine: any, services: any[], sections?: MachinePDFSections) => {
  const s: MachinePDFSections = sections ?? {
    basicInfo: true,
    financial: true,
    financing: true,
    servicesHistory: true,
  };

  const logoData = await loadLogoForPDF();
  const doc = new jsPDF();
  addHeader(doc, `Relatório de Máquina — ${machine.name}`, logoData);

  let y = 45;

  const machineServices = services.filter((sv: any) => sv.machine === machine.name);
  const totalHours = machineServices.reduce((acc: number, sv: any) => {
    if (sv.hora_inicial != null && sv.hora_final != null) {
      const start = typeof sv.hora_inicial === "number" ? sv.hora_inicial : parseFloat(sv.hora_inicial);
      const end = typeof sv.hora_final === "number" ? sv.hora_final : parseFloat(sv.hora_final);
      if (!isNaN(start) && !isNaN(end)) return acc + (end - start);
    }
    return acc + (sv.hours || 0);
  }, 0);
  const totalRevenue = machineServices.reduce((acc: number, sv: any) => acc + (sv.value || 0), 0);
  const totalProfit = machineServices.reduce((acc: number, sv: any) => acc + (sv.profit || 0), 0);

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  // Basic Info
  if (s.basicInfo) {
    const financingStatus = machine.financing
      ? machine.financing.installmentsPaid >= machine.financing.installmentsTotal
        ? "Quitado"
        : "Financiado"
      : "Sem Financiamento";

    autoTable(doc, {
      startY: y,
      head: [["Especificações da Máquina", "Dado"]],
      body: [
        ["Nome / Identificação", machine.name],
        ["Tipo", machine.type || "-"],
        ["Modelo", machine.model || "-"],
        ["Ano de Fabricação", machine.year?.toString() || "-"],
        ["Chassi / Chapa", machine.chapa || "-"],
        ["Custo por Hora", fmt(machine.hour_cost || 0)],
        ["Consumo de Diesel", `${machine.diesel_consumption || 0} L/h`],
        ["Status Atual", machine.status === "em_manutencao" ? "Em Manutenção" : machine.status === "disponivel" ? "Disponível" : "Operando"],
        ["Situação de Pagamento", financingStatus],
      ],
      headStyles: { fillColor: PRIMARY_COLOR, textColor: 255, fontStyle: "bold", fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 1: { fontStyle: "bold" } },
      margin: { left: 20, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // Financial Summary
  if (s.financial) {
    autoTable(doc, {
      startY: y,
      head: [["Resumo Financeiro", "Valor"]],
      body: [
        ["Total de Horas Trabalhadas", `${totalHours.toFixed(1)}h`],
        ["Receita Total Gerada", fmt(totalRevenue)],
        ["Lucro Gerado", fmt(totalProfit)],
        ["Total de OS Realizadas", machineServices.length.toString()],
        ["OS Concluídas", machineServices.filter((sv: any) => sv.status === "concluido").length.toString()],
      ],
      headStyles: { fillColor: [50, 100, 60], textColor: 255, fontStyle: "bold", fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 248, 245] },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
      margin: { left: 20, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // Financing
  if (s.financing && machine.financing) {
    const fin = machine.financing;
    const remaining = fin.totalAmount - fin.paidAmount;
    autoTable(doc, {
      startY: y,
      head: [["Financiamento", "Dado"]],
      body: [
        ["Valor Total do Financiamento", fmt(fin.totalAmount)],
        ["Valor da Parcela Mensal", fmt(fin.monthlyValue)],
        ["Parcelas Pagas", `${fin.installmentsPaid} de ${fin.installmentsTotal}`],
        ["Valor Já Quitado", fmt(fin.paidAmount)],
        ["Valor Restante", fmt(remaining)],
        ["Previsão de Quitação", new Date(fin.endDate).toLocaleDateString("pt-BR")],
        ["Status", fin.installmentsPaid >= fin.installmentsTotal ? "QUITADO" : "EM ANDAMENTO"],
      ],
      headStyles: { fillColor: [100, 60, 140], textColor: 255, fontStyle: "bold", fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 245, 252] },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 1: { fontStyle: "bold" } },
      margin: { left: 20, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // Services History
  if (s.servicesHistory && machineServices.length > 0) {
    if (y > 220) { doc.addPage(); addHeader(doc, `Histórico de Serviços — ${machine.name}`, logoData); y = 45; }
    autoTable(doc, {
      startY: y,
      head: [["OS", "Data", "Cliente", "Horas", "Receita", "Status"]],
      body: machineServices.map((sv: any) => {
        const h = typeof sv.hora_final === "number" && typeof sv.hora_inicial === "number"
          ? (sv.hora_final - sv.hora_inicial).toFixed(1) + "h"
          : "-";
        return [
          sv.id,
          new Date(sv.date).toLocaleDateString("pt-BR"),
          sv.client,
          h,
          fmt(sv.value || 0),
          sv.status === "concluido" ? "Concluído" : "Em andamento",
        ];
      }),
      headStyles: { fillColor: PRIMARY_COLOR, textColor: 255, fontStyle: "bold", fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 20, right: 20 },
    });
  }

  addFooter(doc);
  doc.save(`Maquina_${machine.name.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
};

// ─────────────────────────────────────────────────────────────────────────────
// FREIGHT PDF EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export interface FreightPDFSections {
  routeInfo: boolean;
  vehicleInfo: boolean;
  kmInfo: boolean;
  financial: boolean;
  notes: boolean;
}

export const exportFreightToPDF = async (freight: any, sections?: FreightPDFSections) => {
  const s: FreightPDFSections = sections ?? {
    routeInfo: true,
    vehicleInfo: true,
    kmInfo: true,
    financial: true,
    notes: true,
  };

  const logoData = await loadLogoForPDF();
  const doc = new jsPDF();
  addHeader(doc, `Relatório de Frete — ${freight.id}`, logoData);

  let y = 45;
  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const statusLabel: Record<string, string> = {
    concluido: "Concluído",
    em_andamento: "Em Andamento",
    planejado: "Planejado",
  };

  // Route Info
  if (s.routeInfo) {
    autoTable(doc, {
      startY: y,
      head: [["Informações da Rota", "Dado"]],
      body: [
        ["ID do Frete", freight.id],
        ["Data", new Date(freight.date).toLocaleDateString("pt-BR")],
        ["Origem", freight.origin || "-"],
        ["Destino", freight.destination || "-"],
        ["Status", statusLabel[freight.status] || freight.status],
      ],
      headStyles: { fillColor: PRIMARY_COLOR, textColor: 255, fontStyle: "bold", fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 1: { fontStyle: "bold" } },
      margin: { left: 20, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // Vehicle/Driver
  if (s.vehicleInfo) {
    autoTable(doc, {
      startY: y,
      head: [["Veículo e Condutor", "Dado"]],
      body: [
        ["Máquina Transportada", freight.machine || "-"],
        ["Motorista", freight.driver || "-"],
      ],
      headStyles: { fillColor: [60, 90, 130], textColor: 255, fontStyle: "bold", fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 1: { fontStyle: "bold" } },
      margin: { left: 20, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // KM
  if (s.kmInfo) {
    const kmTotal = freight.km_inicial != null && freight.km_final != null
      ? (freight.km_final - freight.km_inicial).toLocaleString("pt-BR") + " km"
      : "-";
    autoTable(doc, {
      startY: y,
      head: [["Quilometragem", "Valor"]],
      body: [
        ["KM Inicial", freight.km_inicial?.toLocaleString("pt-BR") ?? "-"],
        ["KM Final", freight.km_final?.toLocaleString("pt-BR") ?? "-"],
        ["Total Percorrido", kmTotal],
      ],
      headStyles: { fillColor: [80, 120, 60], textColor: 255, fontStyle: "bold", fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 248, 245] },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
      margin: { left: 20, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // Financial
  if (s.financial) {
    autoTable(doc, {
      startY: y,
      head: [["Financeiro", "Valor"]],
      body: [["Valor Total do Frete", fmt(freight.value || 0)]],
      headStyles: { fillColor: [50, 100, 60], textColor: 255, fontStyle: "bold", fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
      margin: { left: 20, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // Notes
  if (s.notes && freight.notes) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("Observações:", 20, y + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(freight.notes, 170);
    doc.text(lines, 20, y + 11);
  }

  addFooter(doc);
  doc.save(`Frete_${freight.id}_${new Date().toISOString().split("T")[0]}.pdf`);
};

// ─── Client Detail PDF Export ──────────────────────────────────────────────
export const exportClientToPDF = async (
  client: any,
  services: any[],
  options?: { startDate?: string; endDate?: string }
) => {
  const logoData = await loadLogoForPDF();
  const doc = new jsPDF();
  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const filtered = services.filter((s) => {
    const matchStart = !options?.startDate || s.date >= options.startDate;
    const matchEnd = !options?.endDate || s.date <= options.endDate;
    return matchStart && matchEnd;
  });

  const totalBilled = filtered.reduce((a, s) => a + (s.value || 0), 0);
  const totalProfit = filtered.reduce((a, s) => a + (s.profit || 0), 0);

  const periodLabel = (() => {
    if (options?.startDate && options?.endDate)
      return `${new Date(options.startDate + "T00:00").toLocaleDateString("pt-BR")} a ${new Date(options.endDate + "T00:00").toLocaleDateString("pt-BR")}`;
    if (options?.startDate)
      return `A partir de ${new Date(options.startDate + "T00:00").toLocaleDateString("pt-BR")}`;
    if (options?.endDate)
      return `Até ${new Date(options.endDate + "T00:00").toLocaleDateString("pt-BR")}`;
    return "Todo o período";
  })();

  addHeader(doc, `Relatório do Cliente — ${client.name}`, logoData);

  let y = 44;

  // Client block
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Dados do Cliente", 20, y);
  y += 7;

  const clientRows = [
    ["Nome / Razão Social", client.name],
    ["CPF / CNPJ", client.cpf_cnpj || "—"],
    ["Telefone", client.phone || "—"],
    ["E-mail", client.email || "—"],
    ["Cidade / Estado", client.city ? `${client.city} / ${client.state || "—"}` : "—"],
    ["Endereço", client.address || "—"],
  ].filter(([, v]) => v !== "—");

  autoTable(doc, {
    startY: y,
    body: clientRows,
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55, textColor: [80, 80, 80] } },
    margin: { left: 20, right: 20 },
    theme: "plain",
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Period summary
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`Resumo do Período: ${periodLabel}`, 20, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: [
      ["Total de Serviços (OSs)", `${filtered.length}`],
      ["Total Faturado", fmt(totalBilled)],
      ["Lucro Gerado", fmt(totalProfit)],
    ],
    headStyles: { fillColor: PRIMARY_COLOR, textColor: 255, fontStyle: "bold", fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 248, 252] },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
    margin: { left: 20, right: 20 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Services table
  if (filtered.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Histórico de Serviços", 20, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["OS", "Data", "Máquina", "Operador", "Tipo", "Forn. Diesel", "Horas", "Valor", "Status"]],
      body: filtered.map((s) => [
        s.id,
        s.date ? new Date(s.date + "T00:00").toLocaleDateString("pt-BR") : "—",
        s.machine || "—",
        s.operator || "—",
        s.serviceType || "—",
        s.dieselSupplier === "sao_bento" ? "São Bento" : s.dieselSupplier === "cliente" ? "Cliente" : "—",
        s.hours ? `${s.hours}h` : "—",
        fmt(s.value || 0),
        s.status === "concluido" ? "Concluído" : "Em andamento",
      ]),
      headStyles: { fillColor: PRIMARY_COLOR, textColor: 255, fontStyle: "bold", fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 248, 252] },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 15, fontStyle: "bold" },
        1: { cellWidth: 18 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { halign: "right" },
        7: { halign: "right", fontStyle: "bold" },
      },
      margin: { left: 20, right: 20 },
    });
  } else {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    doc.text("Nenhum serviço encontrado no período selecionado.", 20, y + 4);
  }

  addFooter(doc);

  const safeName = client.name.replace(/[^a-zA-Z0-9]/g, "_");
  const dateTag = new Date().toISOString().split("T")[0];
  doc.save(`Cliente_${safeName}_${dateTag}.pdf`);
};

