import xlsx from 'xlsx';
import * as fs from 'fs';

const aponta = xlsx.readFile('attached_assets/APONTAMENTO_DE_MAQUINAS_PROVALIA_1773166355765.xlsx');
const financ = xlsx.readFile('attached_assets/Planilha_de_lançamentos_Locações(1)_1773166355766.xlsm');
const salarios = xlsx.readFile('attached_assets/Salários_Locações__1773166355767.xlsx');
const servicos = xlsx.readFile('attached_assets/Serviço_Locações_1773166355767.xlsx');

const machines = aponta.SheetNames.map(n => n.trim());
console.log("Machines:", machines);

const accounts = financ.SheetNames.filter(n => ['Dinheiro', 'Sicoob', 'BB', 'Boletos Cobranca '].includes(n)).map(n => n.trim());
console.log("Accounts:", accounts);

// For operators, let's check the 'Salários' tab or use the names from tabs that look like people
const operatorTabs = salarios.SheetNames.filter(n => {
  return ['ANDERSON', 'Guri', 'CLEITON', 'CAIO', 'Cristiano', 'BETO', 'Samuel', 'Mimi', 'LUCAS 700j', 'Armack', 'Geovani guri', 'JULIO D51', 'Vitor Guri', 'Dionisio', 'Gean 7d1'].includes(n) || n === 'Salários';
});
console.log("Operator Tabs:", operatorTabs);

const clientTabs = servicos.SheetNames.filter(n => n.trim() !== 'Frete' && !n.includes('DRE') && !n.includes('DFC')).map(n => n.trim());
console.log("Clients:", clientTabs);

