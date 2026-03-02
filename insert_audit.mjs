import { readFileSync, writeFileSync } from 'fs';
let c = readFileSync('src/App.js', 'utf8');
c = c.replace(/\r\n/g, '\n');

const usAudit = `
          audit: {
            totalFindings: 2847,
            resolved: 1934,
            open: 913,
            avgResolutionDays: 847,
            auditingBody: 'Government Accountability Office (GAO) & Inspector General Network',
            lastUpdated: 'Q4 FY2024',
            findings: [
              { id: 'dod-audit', title: 'Dept. of Defense — Audit Failure (6th Consecutive Year)', department: 'Dept. of Defense / DoD IG', severity: 'critical', status: 'open', amountAtRisk: '$886B in assets unverified', year: 2024, description: 'DoD failed its 6th consecutive full financial audit. Auditors could not verify the existence or value of a significant portion of $886B in reported assets, including equipment and military hardware.' },
              { id: 'covid-fraud', title: 'COVID-19 Relief Fraud — SBA & Treasury Programs', department: 'SBA / Treasury IG', severity: 'critical', status: 'partial', amountAtRisk: '$136B improper payments', year: 2023, description: 'GAO estimated $136B in potentially fraudulent or improper COVID-19 relief payments across PPP, EIDL, and unemployment programs. Prosecutions are ongoing; recoveries represent a fraction of total losses.' },
              { id: 'medicare-fraud', title: 'Medicare & Medicaid Improper Payments', department: 'HHS / Centers for Medicare & Medicaid Services', severity: 'high', status: 'open', amountAtRisk: '$95B estimated annually', year: 2024, description: 'HHS OIG estimates $95B in improper payments annually — including billing for services not rendered, duplicate claims, and payments to excluded providers across both programs.' },
              { id: 'irs-backlog', title: 'IRS Unprocessed Returns & Compliance Backlog', department: 'Treasury / TIGTA', severity: 'high', status: 'resolved', amountAtRisk: '$334B in delayed returns', year: 2023, description: 'TIGTA found 17.5 million unprocessed returns creating $334B in delayed refunds and compliance risks. IRS cleared the backlog in 2024 using Inflation Reduction Act funding.' },
              { id: 'snap-improper', title: 'SNAP Improper Payment Rate (5.4%)', department: 'USDA / USDA OIG', severity: 'medium', status: 'open', amountAtRisk: '$8.7B overpayments', year: 2024, description: 'USDA OIG found a 5.4% improper payment rate in SNAP — totalling $8.7B — due to income verification failures and state-level administrative errors in benefit calculations.' },
              { id: 'va-contracts', title: 'VA IT Contracting Waste & Duplicate Contracts', department: 'Dept. of Veterans Affairs / VA OIG', severity: 'medium', status: 'partial', amountAtRisk: '$2.1B waste identified', year: 2024, description: 'VA OIG identified $2.1B in duplicate IT contracts, unused software licenses, and vendor overbilling across the Veterans Benefits Administration technology portfolio.' },
            ],
          },`;

const caAudit = `
          audit: {
            totalFindings: 312,
            resolved: 198,
            open: 114,
            avgResolutionDays: 712,
            auditingBody: 'Office of the Auditor General of Canada (OAG)',
            lastUpdated: 'Spring 2024 Reports to Parliament',
            findings: [
              { id: 'arrivecan', title: 'ArriveCAN App — $60M for an $80,000 App', department: 'CBSA / Public Services and Procurement Canada', severity: 'critical', status: 'resolved', amountAtRisk: '$59.5M overspent', year: 2023, description: 'The OAG found ArriveCAN cost $59.5M — far exceeding its $80,000 estimate — due to undocumented contracts, missing receipts, and inadequate oversight of subcontractor GCstrategies.' },
              { id: 'phoenix', title: 'Phoenix Pay System — Ongoing Remediation Failure', department: 'Public Services and Procurement Canada', severity: 'critical', status: 'open', amountAtRisk: '$3.5B+ in remediation costs', year: 2024, description: 'Despite $3.5B spent on fixes since 2016, Phoenix continues producing pay errors for thousands of federal employees. The replacement HR pay system is years behind its projected delivery date.' },
              { id: 'cerb-overpay', title: 'COVID-19 CERB & Emergency Benefit Overpayments', department: 'Canada Revenue Agency (CRA) / ESDC', severity: 'high', status: 'partial', amountAtRisk: '$4.6B overpaid', year: 2023, description: 'The OAG found $4.6B in CERB and emergency benefit payments made to ineligible recipients — including incarcerated individuals and minors. CRA has recovered less than 15% of the total to date.' },
              { id: 'indigenous-housing', title: 'Indigenous On-Reserve Housing — No National Strategy', department: 'Indigenous Services Canada (ISC)', severity: 'high', status: 'open', amountAtRisk: '$4.3B spent, gap unresolved', year: 2024, description: 'Despite $4.3B in federal investment, ISC has no reliable data on the reserve housing deficit and no national strategy to close it. The OAG found conditions have not measurably improved.' },
              { id: 'dental-rollout', title: 'Canada Dental Care Plan — Rollout Delays & Gaps', department: 'Health Canada / Sun Life (administrator)', severity: 'medium', status: 'open', amountAtRisk: '$4.4B allocated', year: 2024, description: 'The OAG flagged delayed enrollment, unclear eligibility criteria, and inadequate outcome tracking. Only 48% of allocated funds were disbursed in the first year of the CDCP program.' },
              { id: 'green-procurement', title: 'Federal Green Procurement — Missed Targets', department: 'Treasury Board of Canada Secretariat', severity: 'medium', status: 'resolved', amountAtRisk: '$22B annual procurement', year: 2023, description: '15 of 24 federal departments failed to meet green procurement targets. The OAG cited inadequate training and the absence of a consistent reporting framework across government.' },
            ],
          },`;

// US: insert audit before the closing } of the US object (after programs ],)
const usMarker = `          ],\n        }\n      : {\n          totalBudget: '$534.8 Billion',`;
const usReplacement = `          ],` + usAudit + `\n        }\n      : {\n          totalBudget: '$534.8 Billion',`;

if (c.includes(usMarker)) {
  c = c.replace(usMarker, usReplacement);
  console.log('US audit OK');
} else {
  console.log('ERROR: US marker not found');
}

// Canada: insert audit before the closing }; of the Canada object (after programs ],)
const caMarker = `          ],\n        };\n\n    const eff = data.efficiencyScore;`;
const caReplacement = `          ],` + caAudit + `\n        };\n\n    const eff = data.efficiencyScore;`;

if (c.includes(caMarker)) {
  c = c.replace(caMarker, caReplacement);
  console.log('CA audit OK');
} else {
  console.log('ERROR: CA marker not found');
}

writeFileSync('src/App.js', c, 'utf8');
console.log('Done. File size:', c.length);
