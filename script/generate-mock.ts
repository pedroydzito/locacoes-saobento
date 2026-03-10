import xlsx from 'xlsx';
import * as fs from 'fs';

const aponta = xlsx.readFile('attached_assets/APONTAMENTO_DE_MAQUINAS_PROVALIA_1773166355765.xlsx');
const financ = xlsx.readFile('attached_assets/Planilha_de_lançamentos_Locações(1)_1773166355766.xlsm');
const salarios = xlsx.readFile('attached_assets/Salários_Locações__1773166355767.xlsx');
const servicos = xlsx.readFile('attached_assets/Serviço_Locações_1773166355767.xlsx');

// Extract and clean names
const cleanNames = (names) => {
  return [...new Set(names.map(n => n.trim()).filter(n => n && n !== 'Validacao' && n !== 'Frete ' && !n.includes('DRE') && !n.includes('DFC')))];
};

const machines = cleanNames(aponta.SheetNames);
const operators = cleanNames(salarios.SheetNames);
const clients = cleanNames(servicos.SheetNames);
const accounts = cleanNames(financ.SheetNames);

const output = `
// Generated from actual Excel files
export const machinesList = ${JSON.stringify(machines, null, 2)};
export const operatorsList = ${JSON.stringify(operators, null, 2)};
export const clientsList = ${JSON.stringify(clients, null, 2)};
export const accountsList = ${JSON.stringify(accounts, null, 2)};

export const kpis = {
  revenue: 145850.00,
  hours: 1240,
  profit: 85200.00,
  diesel: 4500
};

export const revenueData = [
  { month: "Jan", revenue: 85000, profit: 45000 },
  { month: "Fev", revenue: 92000, profit: 51000 },
  { month: "Mar", revenue: 110000, profit: 62000 },
  { month: "Abr", revenue: 105000, profit: 58000 },
  { month: "Mai", revenue: 125000, profit: 71000 },
  { month: "Jun", revenue: 145850, profit: 85200 },
];

export const machineUsageData = machinesList.slice(0, 5).map((name, i) => ({
  name: name,
  hours: 320 - (i * 40)
}));

// Generate realistic looking recent services using the actual entities
export const recentServices = Array.from({ length: 15 }).map((_, i) => {
  const client = clientsList[i % clientsList.length];
  const machine = machinesList[i % machinesList.length];
  const operator = operatorsList[i % operatorsList.length];
  
  return {
    id: \`SRV-\${1042 + i}\`,
    client,
    machine,
    operator,
    date: new Date(2023, 9, 24 - i).toISOString().split('T')[0],
    hours: 8 + (i % 4),
    diesel: 100 + (i * 10),
    value: 2000 + (i * 200),
    profit: 1200 + (i * 100),
    status: i < 3 ? "andamento" : "concluido"
  };
});
`;

fs.writeFileSync('client/src/lib/mock-data.ts', output);
console.log("Mock data generated with real entities from spreadsheets!");
