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
  machine_assigned: mockMachines[i % mockMachines.length].name,
  hours_worked: 150 + (i * 10),
  services_done: 12 + (i % 5)
}));

export const mockClients = clientsList.map((name, i) => ({
  id: `cli-${i}`,
  name,
  phone: `(62) 99999-${1000 + i}`,
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
  const diesel = hours * machine.diesel_consumption;
  const value = hours * 350; // media cobrada
  const cost_machine = hours * machine.hour_cost;
  const cost_operator = hours * (operator.salary / 220);
  const cost_diesel = diesel * 6.50; // preco diesel
  const profit = value - cost_machine - cost_operator - cost_diesel;

  return {
    id: `SRV-${1000 + i}`,
    client: client.name,
    machine: machine.name,
    operator: operator.name,
    date: new Date(2023, 9, 28 - i).toISOString().split('T')[0],
    hours,
    diesel,
    freight: i % 3 === 0 ? 500 : 0,
    value,
    costs: {
      machine: cost_machine,
      operator: cost_operator,
      diesel: cost_diesel
    },
    profit,
    status: i < 5 ? "andamento" : "concluido",
    notes: ""
  };
});

export const mockTransactions = Array.from({ length: 20 }).map((_, i) => ({
  id: `tx-${i}`,
  type: i % 4 === 0 ? "saida" : "entrada",
  amount: i % 4 === 0 ? 1500 + (i * 100) : 5000 + (i * 500),
  date: new Date(2023, 9, 28 - i).toISOString().split('T')[0],
  description: i % 4 === 0 ? "Pagamento Diesel" : `Recebimento Serviço ${mockServices[i].id}`,
  account: accountsList[i % accountsList.length],
  category: i % 4 === 0 ? "Diesel" : "Serviços"
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