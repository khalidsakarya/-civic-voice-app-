import { readFileSync, writeFileSync } from 'fs';
let c = readFileSync('src/App.js', 'utf8');
c = c.replace(/\r\n/g, '\n');

const usResults = `
          results: [
            { id: 'affordable-housing',  program: 'Affordable Housing Production',      goal: '500,000 new affordable units by 2030',        result: '287,000 units built as of FY2024',         achievedPct: 57,  status: 'delayed'   },
            { id: 'job-creation',        program: 'Infrastructure Job Creation',         goal: '2,000,000 jobs supported',                    result: '1,800,000 jobs created',                   achievedPct: 90,  status: 'on-track'  },
            { id: 'broadband',           program: 'National Broadband Expansion',        goal: '100% household broadband coverage by 2030',   result: '67% of households covered',                achievedPct: 67,  status: 'delayed'   },
            { id: 'ev-charging',         program: 'EV Charging Network Deployment',      goal: '500,000 public chargers by 2030',             result: '192,000 chargers installed',               achievedPct: 38,  status: 'delayed'   },
            { id: 'renewables',          program: 'Renewable Energy Share',              goal: '30% electricity from renewables by 2030',     result: '24% achieved in 2024',                     achievedPct: 80,  status: 'on-track'  },
            { id: 'bridge-repair',       program: 'Bridge & Road Repair Program',        goal: '10,000 bridges repaired',                     result: '8,200 bridges completed',                  achievedPct: 82,  status: 'on-track'  },
            { id: 'student-relief',      program: 'Student Loan Debt Relief',            goal: '$430B in targeted forgiveness',               result: '$175B in relief approved',                 achievedPct: 41,  status: 'delayed'   },
            { id: 'veterans-healthcare', program: 'Veterans Healthcare Access',          goal: '2,000,000 veterans served annually',          result: '2,100,000 veterans served in FY2024',      achievedPct: 105, status: 'completed' },
          ],`;

const caResults = `
          results: [
            { id: 'indigenous-housing',  program: 'Indigenous On-Reserve Housing',       goal: '100,000 new housing units by 2030',           result: '61,000 units completed',                   achievedPct: 61,  status: 'delayed'   },
            { id: 'indigenous-students', program: 'Indigenous Student Support',          goal: '50,000 students supported annually',          result: '43,000 students supported',                achievedPct: 86,  status: 'on-track'  },
            { id: 'dental-enrollment',   program: 'Dental Care Plan Enrollment',         goal: '9,000,000 eligible Canadians enrolled',       result: '2,700,000 Canadians enrolled',             achievedPct: 30,  status: 'delayed'   },
            { id: 'childcare-spaces',    program: 'Regulated Child Care Spaces',         goal: '250,000 new licensed spaces by 2026',         result: '143,000 spaces created',                   achievedPct: 57,  status: 'delayed'   },
            { id: 'water-advisories',    program: 'Drinking Water Advisories on Reserves',goal: 'Zero long-term advisories on reserves',      result: '138 of 166 long-term advisories lifted',   achievedPct: 83,  status: 'on-track'  },
            { id: 'childcare-fee',       program: '$10/Day Child Care Rollout',           goal: 'All 10 provinces at $10/day fee',             result: '7 of 10 provinces reached target',         achievedPct: 70,  status: 'on-track'  },
            { id: 'nato-spending',       program: 'NATO Defence Spending Target',         goal: '2.0% of GDP by 2032',                        result: '1.76% of GDP in FY2024-25',                achievedPct: 88,  status: 'on-track'  },
            { id: 'ghg-reduction',       program: 'Greenhouse Gas Emissions Reduction',   goal: '40% below 2005 levels by 2030',              result: '9% reduction achieved as of 2024',         achievedPct: 23,  status: 'delayed'   },
          ],`;

// US: insert results block after the audit closing }, and before the } : { for Canada
const usMarker = `            ],\n          },\n        }\n      : {\n          totalBudget: '$534.8 Billion',`;
if (c.includes(usMarker)) {
  c = c.replace(usMarker,
    `            ],\n          },` + usResults + `\n        }\n      : {\n          totalBudget: '$534.8 Billion',`);
  console.log('US results OK');
} else {
  console.log('ERROR: US marker not found');
}

// Canada: insert results block after the audit closing }, and before }; + const eff
const caMarker = `            ],\n          },\n        };\n\n    const eff = data.efficiencyScore;`;
if (c.includes(caMarker)) {
  c = c.replace(caMarker,
    `            ],\n          },` + caResults + `\n        };\n\n    const eff = data.efficiencyScore;`);
  console.log('CA results OK');
} else {
  console.log('ERROR: CA marker not found');
}

writeFileSync('src/App.js', c, 'utf8');
console.log('Done. File size:', c.length);
