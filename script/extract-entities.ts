import xlsx from 'xlsx';
import * as fs from 'fs';

const aponta = xlsx.readFile('attached_assets/APONTAMENTO_DE_MAQUINAS_PROVALIA_1773166355765.xlsx');
console.log("Machines Tabs:", aponta.SheetNames);

const financ = xlsx.readFile('attached_assets/Planilha_de_lançamentos_Locações(1)_1773166355766.xlsm');
console.log("Finance Tabs:", financ.SheetNames);

const salarios = xlsx.readFile('attached_assets/Salários_Locações__1773166355767.xlsx');
console.log("Salaries Tabs:", salarios.SheetNames);

const servicos = xlsx.readFile('attached_assets/Serviço_Locações_1773166355767.xlsx');
console.log("Clients Tabs:", servicos.SheetNames);

// Dump some rows from salarios to see operators
console.log("\nSalarios data:");
for (const sheetName of salarios.SheetNames) {
  const data = xlsx.utils.sheet_to_json(salarios.Sheets[sheetName], { header: 1 });
  console.log(`Sheet: ${sheetName}`);
  console.log(JSON.stringify(data.slice(0, 10), null, 2));
}

// Dump some rows from first servicos sheet
console.log("\nServicos data (first sheet):");
const firstServico = xlsx.utils.sheet_to_json(servicos.Sheets[servicos.SheetNames[0]], { header: 1 });
console.log(JSON.stringify(firstServico.slice(0, 10), null, 2));

