import xlsx from 'xlsx';
import * as fs from 'fs';

const files = [
  'attached_assets/APONTAMENTO_DE_MAQUINAS_PROVALIA_1773166355765.xlsx',
  'attached_assets/Planilha_de_lançamentos_Locações(1)_1773166355766.xlsm',
  'attached_assets/Salários_Locações__1773166355767.xlsx',
  'attached_assets/Serviço_Locações_1773166355767.xlsx'
];

for (const file of files) {
  try {
    console.log(`\n\n--- FILE: ${file} ---`);
    const workbook = xlsx.readFile(file);
    const sheetNames = workbook.SheetNames;
    console.log(`Sheets: ${sheetNames.join(', ')}`);
    
    for (const sheetName of sheetNames) {
      console.log(`\nSheet: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      console.log(`Rows: ${data.length}`);
      console.log('Sample data (first 5 rows):');
      console.log(JSON.stringify(data.slice(0, 5), null, 2));
    }
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
  }
}
