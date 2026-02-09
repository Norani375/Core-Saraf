
import { Transaction } from '../types';

export const xmlGenerator = {
  generateDailyXML: (transactions: Transaction[], branchCode: string) => {
    const timestamp = new Date().toISOString();
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<DAB_Report xmlns="http://dab.gov.af/ems/v2">\n`;
    xml += `  <Header>\n`;
    xml += `    <BranchCode>${branchCode}</BranchCode>\n`;
    xml += `    <GeneratedAt>${timestamp}</GeneratedAt>\n`;
    xml += `    <TransactionCount>${transactions.length}</TransactionCount>\n`;
    xml += `  </Header>\n`;
    xml += `  <Transactions>\n`;
    
    transactions.forEach(t => {
      xml += `    <Transaction id="${t.id}">\n`;
      xml += `      <Type>${t.type}</Type>\n`;
      xml += `      <Amount currency="${t.currency}">${t.amount}</Amount>\n`;
      xml += `      <Rate>${t.rate}</Rate>\n`;
      xml += `      <CustomerID>${t.customer_id}</CustomerID>\n`;
      xml += `      <Status>${t.status}</Status>\n`;
      xml += `      <IsSuspicious>${t.is_suspicious}</IsSuspicious>\n`;
      xml += `    </Transaction>\n`;
    });
    
    xml += `  </Transactions>\n`;
    xml += `</DAB_Report>`;
    return xml;
  }
};
