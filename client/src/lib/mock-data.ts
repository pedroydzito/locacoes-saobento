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
  model: name.includes("220") ? "220" : name.includes("700J") ? "700J" : "Standard",
  type: name.includes("ESCAV") || name.includes("SANNY") ? "Escavadeira" : 
        name.includes("Caminhão") ? "Caminhão" : 
        name.includes("Pá") ? "Pá Carregadeira" : 
        name.includes("Trator") ? "Trator" : "Outros",
  year: 2020 - (i % 5),
  hour_cost: 150 + (i * 10),
  diesel_consumption: 15 + (i % 10),
  hours_worked: 1200 + (i * 50),
  profit_generated: 45000 + (i * 2000)
}));

export const mockOperators = operatorsList.map((name, i) => ({
  id: `op-${i}`,
  name,
  salary: 2500 + (i * 200),
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

export const mockServices = Array.from({ length: 25 }).map((_, i) => {
  const client = mockClients[i % mockClients.length];
  const machine = mockMachines[i % mockMachines.length];
  const operator = mockOperators[i % mockOperators.length];
  
  const hours = 8 + (i % 5);
  const hora_inicial = "08:00";
  const endHour = 8 + hours;
  const hora_final = `${endHour < 10 ? '0' : ''}${endHour}:00`;
  const diesel = hours * machine.diesel_consumption;
  const value = hours * 350; // media cobrada
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
    freight: i % 3 === 0 ? 500 : 0,
    value,
    costs: {
      machine: cost_machine,
      operator: cost_operator,
      diesel: cost_diesel
    },
    additionalCosts,
    profit,
    status: i < 5 ? "andamento" : "concluido",
    notes: ""
  };
});

export let mockTransactions = Array.from({ length: 20 }).map((_, i) => ({
  id: `tx-${i}`,
  type: i % 4 === 0 ? "saida" : "entrada",
  amount: i % 4 === 0 ? 1500 + (i * 100) : 5000 + (i * 500),
  date: new Date(2023, 9, 28 - i).toISOString().split('T')[0],
  description: i % 4 === 0 ? "Pagamento Diesel" : `Recebimento Serviço ${mockServices[i]?.id || 'N/A'}`,
  account: accountsList[i % accountsList.length],
  category: i % 4 === 0 ? "Diesel" : "Serviços",
  createdAt: new Date(2023, 9, 28 - i).toISOString(),
  createdBy: "admin@saobento.com",
  relatedCostId: undefined as string | undefined,
  relatedServiceId: undefined as string | undefined
}));

export const mockFreights = Array.from({ length: 10 }).map((_, i) => ({
  id: `FRT-${1000 + i}`,
  date: new Date(2023, 9, 28 - i).toISOString().split('T')[0],
  machine: mockMachines[i % mockMachines.length].name,
  origin: ["Pátio Central", "Obra Alpha", "Fazenda Boa Vista", "Pátio Central", "Rio Verde"][i % 5],
  destination: ["Obra Alpha", "Fazenda Boa Vista", "Rio Verde", "Aparecida de Goiânia", "Pátio Central"][i % 5],
  driver: ["Roberto", "Carlos", "Juliano"][i % 3],
  value: 800 + (i * 150),
  status: i < 2 ? "planejado" : i < 4 ? "em_andamento" : "concluido",
  notes: ""
}));

export const kpis = {
  revenue: mockTransactions.filter(t => t.type === 'entrada').reduce((acc, curr) => acc + curr.amount, 0),
  hours: mockServices.reduce((acc, curr) => acc + curr.hours, 0),
  profit: mockServices.reduce((acc, curr) => acc + curr.profit, 0),
  diesel: mockServices.reduce((acc, curr) => acc + curr.diesel, 0)
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