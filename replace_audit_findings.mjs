import { readFileSync, writeFileSync } from 'fs';
let c = readFileSync('src/App.js', 'utf8');
c = c.replace(/\r\n/g, '\n');

// ── US findings block ──────────────────────────────────────────
const usStart = `lastUpdated: 'Q4 FY2024',\n            findings: [`;
const usEnd   = `\n            ],\n          },\n        }\n      : {`;

const usNew = `lastUpdated: 'Q4 FY2024',
            findings: [
              { id: 'dod-financial',        title: 'Defense Department Financial Statement Audit',            auditBody: 'Government Accountability Office (GAO)',                          date: 'March 2024',    severity: 'high',   status: 'open',     description: 'Audit identified material weaknesses in financial management systems across major DoD components, limiting the department\'s ability to produce reliable financial statements for the sixth consecutive year.' },
              { id: 'covid-controls',       title: 'COVID-19 Relief Program Disbursement Controls',          auditBody: 'Government Accountability Office (GAO)',                          date: 'September 2023', severity: 'high',   status: 'partial',  description: 'Audit identified control weaknesses in pandemic relief distribution across multiple agencies, with insufficient upfront verification contributing to payments that did not meet program eligibility criteria.' },
              { id: 'medicare-billing',     title: 'Medicare Part B Provider Billing Accuracy',              auditBody: 'HHS Office of Inspector General (OIG)',                           date: 'June 2024',     severity: 'high',   status: 'open',     description: 'Audit identified billing irregularity patterns in Medicare Part B claims and noted weaknesses in provider credentialing verification and post-payment review processes.' },
              { id: 'irs-service',          title: 'IRS Taxpayer Correspondence Backlogs',                   auditBody: 'Treasury Inspector General for Tax Administration (TIGTA)',       date: 'December 2023', severity: 'medium', status: 'resolved', description: 'Audit identified multi-year backlogs in taxpayer correspondence processing and noted staffing and workflow gaps that delayed timely responses to taxpayer inquiries and amended returns.' },
              { id: 'snap-verification',    title: 'SNAP State-Level Eligibility Verification Gaps',         auditBody: 'USDA Office of Inspector General (OIG)',                          date: 'April 2024',    severity: 'medium', status: 'open',     description: 'Audit identified income and household verification weaknesses in state-administered SNAP programs, finding inconsistent application of federal eligibility rules across multiple states.' },
              { id: 'va-it-contracts',      title: 'VA Information Technology Procurement Oversight',        auditBody: 'VA Office of Inspector General (OIG)',                            date: 'January 2024',  severity: 'medium', status: 'partial',  description: 'Audit identified duplicate contract awards and underutilised software licences in VA technology procurement, with insufficient oversight controls to prevent redundant vendor agreements.' },
              { id: 'infrastructure-rep',   title: 'Bipartisan Infrastructure Law Progress Reporting',       auditBody: 'Government Accountability Office (GAO)',                          date: 'August 2024',   severity: 'low',    status: 'open',     description: 'Audit identified inconsistencies in agency reporting on Infrastructure Law project milestones and spending, reducing the reliability of publicly disclosed progress information.' },
              { id: 'federal-property',     title: 'Federal Real Property Utilisation and Disposal',         auditBody: 'Government Accountability Office (GAO)',                          date: 'May 2024',      severity: 'low',    status: 'open',     description: 'Audit identified approximately 7,700 underutilised federal properties with insufficient maintenance planning and no coordinated disposal strategy to reduce ongoing carrying costs.' },
            ]`;

const usMarker = usStart + c.slice(c.indexOf(usStart) + usStart.length, c.indexOf(usEnd, c.indexOf(usStart)));
if (c.includes(usStart)) {
  const startIdx = c.indexOf(usStart);
  const endIdx   = c.indexOf(usEnd, startIdx);
  if (endIdx !== -1) {
    c = c.slice(0, startIdx) + usNew + c.slice(endIdx);
    console.log('US findings replaced OK');
  } else { console.log('ERROR: US end marker not found'); }
} else { console.log('ERROR: US start marker not found'); }

// ── Canada findings block ──────────────────────────────────────
const caStart = `lastUpdated: 'Spring 2024 Reports to Parliament',\n            findings: [`;
const caEnd   = `\n            ],\n          },\n        };`;

const caNew = `lastUpdated: 'Spring 2024 Reports to Parliament',
            findings: [
              { id: 'it-contracting',       title: 'Federal IT Contracting Documentation Practices',         auditBody: 'Office of the Auditor General (OAG)',                             date: 'February 2023', severity: 'high',   status: 'resolved', description: 'Audit identified significant gaps in contract documentation for federal IT projects, including missing deliverables records, undisclosed subcontracting arrangements, and invoices lacking supporting documentation.' },
              { id: 'phoenix-pay',          title: 'Phoenix Pay System Remediation Progress',                auditBody: 'Office of the Auditor General (OAG)',                             date: 'May 2024',      severity: 'high',   status: 'open',     description: 'Audit identified persistent systemic weaknesses in federal pay administration, with thousands of employees continuing to receive incorrect payments after eight years of remediation efforts and substantial ongoing investment.' },
              { id: 'pandemic-benefits',    title: 'Pandemic Emergency Benefit Eligibility Controls',        auditBody: 'Office of the Auditor General (OAG)',                             date: 'May 2023',      severity: 'high',   status: 'partial',  description: 'Audit identified weaknesses in upfront eligibility verification for emergency pandemic income support programs, resulting in payments to individuals who did not satisfy program criteria.' },
              { id: 'first-nations-housing',title: 'First Nations On-Reserve Housing Program Outcomes',     auditBody: 'Office of the Auditor General (OAG)',                             date: 'March 2024',    severity: 'high',   status: 'open',     description: 'Audit identified the absence of a national housing strategy and reliable outcome measurement for on-reserve housing investments, limiting accountability for federal program expenditures.' },
              { id: 'dental-plan',          title: 'Canada Dental Care Plan Rollout and Administration',    auditBody: 'Office of the Auditor General (OAG)',                             date: 'November 2024', severity: 'medium', status: 'open',     description: 'Audit identified enrollment delays, gaps in eligibility communication, and the absence of outcome tracking mechanisms during the initial rollout phase of the national dental care program.' },
              { id: 'green-procurement',    title: 'Federal Green Procurement Commitment Compliance',        auditBody: 'Office of the Auditor General (OAG)',                             date: 'October 2023',  severity: 'medium', status: 'resolved', description: 'Audit identified that the majority of federal departments reviewed had not fulfilled their green procurement commitments, citing inadequate training and the absence of a standardised reporting framework.' },
              { id: 'defence-procurement',  title: 'National Defence Major Equipment Procurement',          auditBody: 'Office of the Auditor General (OAG)',                             date: 'April 2024',    severity: 'medium', status: 'open',     description: 'Audit identified schedule delays and cost growth in major Canadian Armed Forces equipment acquisition projects, with reporting to Parliament not accurately reflecting the full scope of cost changes.' },
              { id: 'ei-automation',        title: 'Employment Insurance Automated Decision Accuracy',      auditBody: 'Office of the Auditor General (OAG)',                             date: 'September 2024',severity: 'low',    status: 'open',     description: 'Audit identified that automated eligibility processing in the Employment Insurance system generated decision errors in a subset of claims, with insufficient manual review mechanisms to identify system-generated mistakes.' },
            ]`;

if (c.includes(caStart)) {
  const startIdx = c.indexOf(caStart);
  const endIdx   = c.indexOf(caEnd, startIdx);
  if (endIdx !== -1) {
    c = c.slice(0, startIdx) + caNew + c.slice(endIdx);
    console.log('CA findings replaced OK');
  } else { console.log('ERROR: CA end marker not found'); }
} else { console.log('ERROR: CA start marker not found'); }

writeFileSync('src/App.js', c, 'utf8');
console.log('Done. File size:', c.length);
