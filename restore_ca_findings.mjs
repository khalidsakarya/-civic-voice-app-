import { readFileSync, writeFileSync } from 'fs';
let c = readFileSync('src/App.js', 'utf8');
c = c.replace(/\r\n/g, '\n');

const caStart = `lastUpdated: 'Spring 2024 Reports to Parliament',\n            findings: [`;
const caEnd   = `\n            ],\n          },`;

const startIdx = c.indexOf(caStart);
if (startIdx === -1) { console.log('ERROR: CA start not found'); process.exit(1); }
const endIdx = c.indexOf(caEnd, startIdx);
if (endIdx === -1) { console.log('ERROR: CA end not found'); process.exit(1); }

const caNew = `lastUpdated: 'Spring 2024 Reports to Parliament',
            findings: [
              { id: 'arrivecan',            title: 'ArriveCAN App — $60M for an $80,000 Application',           auditBody: 'Office of the Auditor General (OAG)',                             date: 'February 2023', severity: 'critical', amountAtRisk: '$59.5M overspent',             description: 'The OAG found the ArriveCAN app cost $59.5M — far exceeding its $80,000 estimated value — due to undocumented contracts, missing receipts, and payments to GCstrategies with no supporting records.' },
              { id: 'phoenix-pay',          title: 'Phoenix Pay System — Ongoing Remediation Failure',           auditBody: 'Office of the Auditor General (OAG)',                             date: 'May 2024',      severity: 'critical', amountAtRisk: '$3.5B+ in remediation costs',  description: 'Despite $3.5B in remediation spending since 2016, the OAG found the federal pay system continues to produce incorrect payments for thousands of employees, with the replacement NextGen HR system years behind its scheduled delivery.' },
              { id: 'cerb-overpay',         title: 'COVID-19 CERB and Emergency Benefit Overpayments',          auditBody: 'Office of the Auditor General (OAG)',                             date: 'May 2023',      severity: 'high',     amountAtRisk: '$4.6B overpaid',               description: 'The OAG found $4.6B in CERB and pandemic emergency benefit payments made to ineligible recipients, including incarcerated individuals and minors. Less than 15% has been recovered by CRA to date.' },
              { id: 'indigenous-housing',   title: 'Indigenous On-Reserve Housing — No National Strategy',       auditBody: 'Office of the Auditor General (OAG)',                             date: 'March 2024',    severity: 'high',     amountAtRisk: '$4.3B spent, gap unresolved',  description: 'The OAG found that despite $4.3B in federal housing investment, Indigenous Services Canada has no reliable data on the reserve housing deficit and no national strategy to close it. Conditions have not measurably improved.' },
              { id: 'mckinsey-contracts',   title: 'McKinsey & Company Federal Contracts — Sole-Source Awards',  auditBody: 'Public Services and Procurement Canada / OAG',                   date: 'October 2023',  severity: 'high',     amountAtRisk: '$209M in contracts awarded',   description: 'An audit found $209M in federal contracts awarded to McKinsey & Company, many without competitive bidding, with inadequate documentation of deliverables and value received by taxpayers.' },
              { id: 'dental-plan',          title: 'Canada Dental Care Plan — Rollout Delays and Gaps',          auditBody: 'Office of the Auditor General (OAG)',                             date: 'November 2024', severity: 'medium',   amountAtRisk: '$4.4B allocated',              description: 'The OAG found enrollment delays, unclear eligibility rules, and no outcome tracking in the first year of the dental plan rollout. Only 48% of the $4.4B allocated budget was disbursed to enrollees.' },
              { id: 'shipbuilding',         title: 'National Shipbuilding Strategy — Delays and Cost Overruns',  auditBody: 'Office of the Auditor General (OAG)',                             date: 'April 2024',    severity: 'medium',   amountAtRisk: '$84B shipbuilding program',    description: 'The OAG found major schedule delays and cost growth across the National Shipbuilding Strategy, with combat and non-combat vessel projects years behind delivery dates and no credible revised timeline provided to Parliament.' },
              { id: 'green-procurement',    title: 'Federal Green Procurement — Widespread Missed Targets',      auditBody: 'Office of the Auditor General (OAG)',                             date: 'October 2023',  severity: 'low',      amountAtRisk: '$22B annual procurement',      description: 'The OAG found 15 of 24 federal departments failed to meet green procurement targets, with inadequate training and no standard reporting framework across government, despite $22B in annual federal purchasing power.' },
            ]`;

c = c.slice(0, startIdx) + caNew + c.slice(endIdx);
console.log('CA findings restored OK');

writeFileSync('src/App.js', c, 'utf8');
console.log('Done. File size:', c.length);
