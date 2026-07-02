export const machinesList = [
  "220 NOVA ESCAV", "220 ANTIGA ESCAV", "SANNY", "700J novo A", "700J Nova",
  "Caminhão 2544", "Caminhão 1513", "12B Pá Carregadeira", "Trator 7D1",
  "MAQ DO JOÃO", "STRADA PRETA", "STRADA BRANCA", "Moto", "D150"
];

export const operatorsList = [
  "Anderson", "Guri", "Cleiton", "Caio", "Cristiano", "Beto", "Samuel",
  "Mimi", "Lucas 700j", "Armack", "Geovani guri", "Julio D51", "Vitor Guri",
  "Dionisio", "Gean 7d1"
];

export const clientsList = [
  "Geovani Reis", "Antenor", "Claré", "Leandro Reis", "Deivid",
  "Compestre", "Josual", "Valdeci", "Mane", "Juca", "Provalia",
  "Conceição", "Agri"
];

export const accountsList = [
  "Dinheiro", "Sicoob", "Banco do Brasil", "Boletos Cobrança"
];

export let mockAccounts = accountsList.map((name, i) => ({
  id: `acc-${i}`,
  name,
  isDefault: ["Dinheiro", "Boletos Cobrança", "Sicoob", "Banco do Brasil"].includes(name)
}));

// Enhanced Mock Data structures following the prompt's exact specs
export const mockMachines = machinesList.map((name, i) => ({
  id: `maq-${i}`,
  name,
  chapa: i % 2 === 0 ? `CH-00${i}` : undefined,
  model: name.includes("220") ? "220" : name.includes("700J") ? "700J" : "Standard",
  type: name.includes("ESCAV") || name.includes("SANNY") ? "Escavadeira" :
    name.includes("Caminhão") ? "Caminhão" :
      name.includes("Pá") ? "Pá Carregadeira" :
        name.includes("Trator") ? "Trator" : "Outros",
  year: 2020 - (i % 5),
  hour_cost: 150 + (i * 10),
  diesel_consumption: 15 + (i % 10),
  hours_worked: 1200 + (i * 50),
  profit_generated: 45000 + (i * 2000),
  status: i % 4 === 0 ? "em_manutencao" : "operando",
  financing: i % 3 === 0 ? undefined : {
    isFinanced: true,
    totalAmount: 350000 + (i * 50000),
    paidAmount: (350000 + (i * 50000)) * (0.3 + (i * 0.1 > 0.6 ? 0.6 : i * 0.1)),
    installmentsTotal: 60,
    installmentsPaid: Math.floor(60 * (0.3 + (i * 0.1 > 0.6 ? 0.6 : i * 0.1))),
    monthlyValue: (350000 + (i * 50000)) / 60,
    endDate: new Date(2028, 5 + i, 10).toISOString().split('T')[0]
  }
}));

export const mockOperators = operatorsList.map((name, i) => ({
  id: `op-${i}`,
  name,
  username: name.toLowerCase().replace(/\s+/g, ''),
  password: "123",
  salary: 2500 + (i * 200),
  commission_per_hour: 10 + (i % 5),
  fixed_commission: i % 2 === 0 ? 50 : 0,
  machine_assigned: i === 0
    ? [mockMachines[0].name, mockMachines[1].name]
    : [mockMachines[i % mockMachines.length].name],
  hours_worked: 150 + (i * 10),
  services_done: 12 + (i % 5)
}));

export const mockClients = clientsList.map((name, i) => ({
  id: `cli-${i}`,
  name,
  phone: `(62) 99999-${1000 + i}`,
  email: `contato${i}@${name.toLowerCase().replace(/\s/g, '')}.com`,
  cpf_cnpj: i % 2 === 0 ? `11.111.111/0001-${10 + i}` : `111.222.333-${10 + i}`,
  city: ["Goiânia", "Aparecida de Goiânia", "Rio Verde", "Anápolis"][i % 4],
  notes: "Cliente preferencial",
  total_billed: 15000 + (i * 5000),
  machines_used: mockMachines.slice(0, (i % 3) + 1).map(m => m.name)
}));

export interface Service {
  id: string;
  client: string;
  machine: string;
  operator: string;
  date: string;
  hora_inicial: number;
  hora_final?: number;
  hours?: number;
  diesel?: number;
  dieselSupplier?: string;
  serviceType?: string;
  safra?: string;
  freight?: number;
  fixedValue?: number;
  hourlyValue?: number;
  value?: number;
  costs?: {
    machine: number;
    operator: number;
    diesel: number;
  };
  additionalCosts?: any[];
  profit?: number;
  status: string;
  photos?: any[];
  notes?: string;
}

export const mockServices: Service[] = Array.from({ length: 25 }).map((_, i) => {
  const client = mockClients[i % mockClients.length];
  const machine = mockMachines[i % mockMachines.length];
  const operator = mockOperators[i % mockOperators.length];

  const hours = 8 + (i % 5);
  const baseHorimeter = 1200 + (i * 47.3);
  const hora_inicial = Number(baseHorimeter.toFixed(1));
  const hora_final = Number((baseHorimeter + hours).toFixed(1));
  const diesel = hours * machine.diesel_consumption;
  const fixedValue = i % 2 === 0 ? 500 : 0;
  const hourlyValue = 350; // media cobrada
  const value = fixedValue + (hours * hourlyValue);
  const cost_machine = hours * machine.hour_cost;
  const cost_operator = hours * (operator.salary / 220);
  const cost_diesel = diesel * 6.50; // preco diesel

  const additionalCosts = [
    { id: `cst-${i}-1`, name: "Custo Máquina", value: cost_machine, createdAt: new Date(2023, 9, 28 - i).toISOString(), createdBy: "admin@saobento.com" },
    { id: `cst-${i}-2`, name: "Custo Operador", value: cost_operator, createdAt: new Date(2023, 9, 28 - i).toISOString(), createdBy: "admin@saobento.com" },
    { id: `cst-${i}-3`, name: "Custo Diesel", value: cost_diesel, createdAt: new Date(2023, 9, 28 - i).toISOString(), createdBy: "admin@saobento.com" }
  ];

  const total_costs = additionalCosts.reduce((acc, curr) => acc + curr.value, 0);
  const profit = value - total_costs;

  return {
    id: `SRV-${1000 + i}`,
    client: client.name,
    machine: machine.name,
    operator: operator.name,
    date: new Date(2023, 9, 28 - i).toISOString().split('T')[0],
    hora_inicial,
    hora_final,
    hours,
    diesel,
    dieselSupplier: i % 2 === 0 ? "sao_bento" : "cliente",
    serviceType: ["Terraplanagem", "Destoca", "Transporte"][i % 3],
    safra: i % 2 === 0 ? "2023/24" : "2024/25",
    freight: i % 3 === 0 ? 500 : 0,
    fixedValue,
    hourlyValue,
    costs: {
      machine: cost_machine,
      operator: cost_operator,
      diesel: cost_diesel
    },
    additionalCosts,
    value,
    profit,
    status: i < 5 ? "em_andamento" : "concluido",
    photos: i % 5 === 0 ? [
      { url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400", label: "Horímetro Inicial" },
      { url: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400", label: "Horímetro Final" }
    ] : [],
    notes: ""
  };
});

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string;
  account: string;
  category: string;
  supplier?: string;
  dueDate?: string;
  boletoInfo?: {
    installment: string;
    isPaid: boolean;
    delayDays: number;
    interestValue: number;
  };
  allocation?: string;
  createdAt: string;
  createdBy: string;
  relatedCostId?: string;
  relatedServiceId?: string;
}

export let mockTransactions: Transaction[] = Array.from({ length: 20 }).map((_, i) => {
  const isExpense = i % 4 === 0;
  const baseAccount = accountsList[i % accountsList.length];
  const isBoleto = baseAccount === "Boletos Cobrança" || i === 1 || i === 2; // Force some to be Boletos for testing
  
  const today = new Date();
  const dueDate = isBoleto 
    ? (i % 2 === 0 ? today.toISOString().split('T')[0] : new Date(today.getTime() + 86400000 * 2).toISOString().split('T')[0]) 
    : (isExpense ? new Date(2023, 9, 30 - i).toISOString().split('T')[0] : undefined);
    
  const amount = isExpense ? 1500 + (i * 100) : 5000 + (i * 500);

  return {
    id: `tx-${i}`,
    type: isExpense ? "saida" : "entrada",
    amount,
    date: new Date(2023, 9, 28 - i).toISOString().split('T')[0],
    description: isExpense ? "Pagamento Diesel" : `Recebimento Serviço ${mockServices[i]?.id || 'N/A'}`,
    account: isBoleto ? "Boletos Cobrança" : baseAccount,
    category: isExpense ? "Diesel" : "Serviços",
    supplier: isExpense ? ["Posto Rodonave", "Oficina do João", "Pneus & Cia"][i % 3] : undefined,
    dueDate,
    boletoInfo: isBoleto ? {
      installment: `${(i % 12) + 1}/12`,
      isPaid: i % 3 === 0,
      delayDays: i % 3 === 0 ? 0 : (i % 2 === 0 ? 0 : 5),
      interestValue: (i % 3 !== 0 && i % 2 !== 0) ? amount * 0.02 : 0
    } : undefined,
    allocation: isExpense ? (i % 2 === 0 ? "Administrativo" : mockMachines[i % mockMachines.length].name) : undefined,
    createdAt: new Date(2023, 9, 28 - i).toISOString(),
    createdBy: "admin@saobento.com",
    relatedCostId: undefined as string | undefined,
    relatedServiceId: undefined as string | undefined
  };
});

export const mockFreights = Array.from({ length: 10 }).map((_, i) => ({
  id: `FRT-${1000 + i}`,
  date: new Date(2023, 9, 28 - i).toISOString().split('T')[0],
  machine: mockMachines[i % mockMachines.length].name,
  origin: ["Pátio Central", "Obra Alpha", "Fazenda Boa Vista", "Pátio Central", "Rio Verde"][i % 5],
  destination: ["Obra Alpha", "Fazenda Boa Vista", "Rio Verde", "Aparecida de Goiânia", "Pátio Central"][i % 5],
  driver: ["Roberto", "Carlos", "Juliano"][i % 3],
  value: 800 + (i * 150),
  km_inicial: 10000 + (i * 100),
  km_final: 10000 + (i * 100) + 150 + (i * 10),
  status: i < 2 ? "planejado" : i < 4 ? "em_andamento" : "concluido",
  notes: ""
}));

export const kpis = {
  revenue: mockTransactions.filter(t => t.type === 'entrada').reduce((acc, curr) => acc + (curr.amount || 0), 0),
  hours: mockServices.reduce((acc, curr) => acc + (curr.hours || 0), 0),
  profit: mockServices.reduce((acc, curr) => acc + (curr.profit || 0), 0),
  diesel: mockServices.reduce((acc, curr) => acc + (curr.diesel || 0), 0)
};

export const revenueData = [
  { month: "Mai", revenue: 85000, profit: 45000 },
  { month: "Jun", revenue: 92000, profit: 51000 },
  { month: "Jul", revenue: 110000, profit: 62000 },
  { month: "Ago", revenue: 105000, profit: 58000 },
  { month: "Set", revenue: 125000, profit: 71000 },
  { month: "Out", revenue: kpis.revenue, profit: kpis.profit },
];

export const machineUsageData = mockMachines.slice(0, 6).map(m => ({
  name: m.name,
  hours: m.hours_worked
})).sort((a, b) => b.hours - a.hours);

export const mockInventory = [
  { id: "inv-0", name: "Filtro de Óleo", code: "FO-220", quantity: 5, minQuantity: 10, unit: "unidades", unitPrice: 85.50 },
  { id: "inv-1", name: "Óleo Diesel S10", code: "OD-S10", quantity: 1500, minQuantity: 500, unit: "litros", unitPrice: 6.50 },
  { id: "inv-2", name: "Óleo Hidráulico", code: "OH-68", quantity: 200, minQuantity: 100, unit: "litros", unitPrice: 25.00 },
  { id: "inv-3", name: "Filtro de Combustível", code: "FC-01", quantity: 15, minQuantity: 10, unit: "unidades", unitPrice: 45.00 },
  { id: "inv-4", name: "Filtro de Ar Secundário", code: "FA-S2", quantity: 3, minQuantity: 5, unit: "unidades", unitPrice: 95.00 },
  { id: "inv-5", name: "Graxa", code: "GRX-01", quantity: 50, minQuantity: 20, unit: "kg", unitPrice: 35.00 }
];

export interface OperatorTransaction {
  id: string;
  operatorId: string;
  date: string;
  type: "Vale" | "Adiantamento" | "Bonificação" | "Desconto";
  amount: number;
  description: string;
}

export const mockOperatorTransactions: OperatorTransaction[] = [
  { id: "otx-1", operatorId: "op-0", date: new Date().toISOString().split('T')[0], type: "Vale", amount: 150, description: "Vale farmácia" },
  { id: "otx-2", operatorId: "op-0", date: new Date().toISOString().split('T')[0], type: "Bonificação", amount: 200, description: "Meta batida" },
  { id: "otx-3", operatorId: "op-1", date: new Date().toISOString().split('T')[0], type: "Adiantamento", amount: 500, description: "Adiantamento salarial" },
];