/**
 * CA-ON (Ontario) — official economic sources.
 *
 * CV-DATA-002  unemployment  → subnational_economic_social_stats/CA-ON
 * CV-DATA-008  CRA Charities → subnational_tax_exempt_entities/CA-ON
 * CV-DATA-014  ON Transfer   → subnational_grants/CA-ON
 */

const {
  MAX_RECORDS,
  INDUSTRY_BADGE,
  trim,
  num,
  fmtCompact,
  parseMoneyish,
  fetchText,
  fetchJson,
  parseCsv,
} = require('./subnational-transparency-shared.cjs');
const {
  statcanProvincialUnemployment,
  STATCAN_ON_COORD,
  STATCAN_CA_COORD,
} = require('./subnational-unemployment-monthly.cjs');

const JURISDICTION_ID = 'CA-ON';

const SOURCES = {
  unemployment: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410028701',
  // CRA Charities — open.canada.ca pkg 51c68b86-33f0-46fe-9b51-0a786d0088f5
  // ident_updated.csv: BN,Category,Designation,Legal Name,Account Name,Address,City,Province,...
  charities: 'https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5',
  charitiesCkanPkg:
    'https://open.canada.ca/data/api/3/action/package_show?id=51c68b86-33f0-46fe-9b51-0a786d0088f5',
  // Ontario Public Accounts: Detailed Schedule of Payments — data.ontario.ca
  // pkg 56c9a95f-c7b6-40ee-a4b8-d2343e51c83d
  // Columns: Amount $,Ministry,Category,Payment Detail,Recipient,Statutory,Additional Detail
  // Licence: Ontario.ca Terms of Use (not OGL-Ontario)
  transferPayments: 'https://data.ontario.ca/dataset/public-accounts-detailed-schedule-of-payments',
  transferPaymentsCkanPkg:
    'https://data.ontario.ca/api/3/action/package_show?id=56c9a95f-c7b6-40ee-a4b8-d2343e51c83d',
};

// ─── Economic (CV-DATA-002 — Statistics Canada unemployment) ──────────────────

async function buildEconomic() {
  const out = {
    jurisdiction_id: JURISDICTION_ID,
    reporting_period: 'Monthly provincial unemployment (Statistics Canada LFS)',
  };
  const notes = [];

  try {
    const unemp = await statcanProvincialUnemployment(
      STATCAN_ON_COORD,
      STATCAN_CA_COORD,
      'Ontario',
      'CA Average',
      24,
    );
    if (unemp) Object.assign(out, unemp);
  } catch (err) {
    notes.push(`unemployment: ${err.message}`);
  }

  out.data_status = { notes };
  return out;
}

// ─── Tax / Charities (CV-DATA-008 — CRA Charities Registry) ──────────────────

/** Map CRA category-of-activity text to existing INDUSTRY_BADGE keys. */
function industryFromCraCat(category) {
  const c = trim(category).toLowerCase();
  if (/educ/i.test(c)) return { label: 'Education', color: INDUSTRY_BADGE.Education };
  if (/health|santé|sante|medical/i.test(c)) return { label: 'Health', color: INDUSTRY_BADGE.Health };
  if (/relig/i.test(c)) return { label: 'Religion', color: INDUSTRY_BADGE.Religion };
  if (/environ/i.test(c)) return { label: 'Environment', color: INDUSTRY_BADGE.Environment };
  if (/art|cultur/i.test(c)) return { label: 'Arts/Culture', color: INDUSTRY_BADGE['Arts/Culture'] };
  if (/service|human|social|welfare|community/i.test(c))
    return { label: 'Human Services', color: INDUSTRY_BADGE['Human Services'] };
  return { label: 'Other', color: INDUSTRY_BADGE.Other };
}

async function buildTax() {
  // 1. Discover CSV resource URL via CKAN package_show
  // Package has multiple CSVs; target the "Identification" resource (ident_updated.csv)
  // which contains: BN, Category, Designation, Legal Name, Account Name, ..., Province, ...
  const pkg = await fetchJson(SOURCES.charitiesCkanPkg);
  const resources = pkg?.result?.resources || [];
  const csvRes =
    resources.find((r) => /ident/i.test(trim(r.name)) && trim(r.format).toUpperCase() === 'CSV') ||
    resources.find((r) => /ident/i.test(trim(r.url).toLowerCase())) ||
    resources.find((r) => trim(r.format).toUpperCase() === 'CSV');
  if (!csvRes || !trim(csvRes.url)) {
    throw new Error(
      `CRA Charities: no CSV resource found. Resources in package: ${resources.map((r) => `${r.name || r.id} (${r.format})`).join(', ')}`,
    );
  }

  // 2. Download identification CSV (all-Canada list — filter to Ontario in-flight)
  const csvUrl = trim(csvRes.url);
  const csvText = await fetchText(csvUrl, 50 * 1024 * 1024);
  const { headers, rows } = parseCsv(csvText);

  // 3. Detect column names (ident_updated.csv: Legal Name, Province, Category, Designation)
  const provCol = headers.find((h) => /^province$/i.test(trim(h))) ||
    headers.find((h) => /province/i.test(h));
  // Prefer "Legal Name" over "Account Name" or "Public Contact Name"
  const nameCol = headers.find((h) => /legal.name/i.test(trim(h))) ||
    headers.find((h) => /^name$/i.test(trim(h))) ||
    headers.find((h) => /name|nom/i.test(h) && !/province|contact|account/i.test(h));
  const catCol = headers.find((h) => /categ/i.test(h));
  // "Designation" column = Charitable Organization | Public Foundation | Private Foundation
  const desigCol = headers.find((h) => /designat/i.test(h));

  if (!provCol || !nameCol) {
    throw new Error(
      `CRA Charities CSV: required columns not found. Detected headers: ${headers.slice(0, 20).join(', ')}`,
    );
  }

  // 4. Filter to Ontario only (ident_updated.csv contains all provinces, including revoked)
  const candidates = [];
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const prov = trim(row[provCol]).toUpperCase();
    if (prov !== 'ON' && prov !== 'ONTARIO') continue;
    candidates.push(row);
  }

  // CRA Designation codes — source: codes_en.pdf (CRA Charities IT system, last revised 2025-11-28)
  // A=Public Foundation, B=Private Foundation, C=Charitable Organization
  // PF/PBF/QD appear in some resource variants; mapped for completeness.
  const CRA_DESIG = {
    A: 'Public Foundation',
    B: 'Private Foundation',
    C: 'Charitable Organization',
    PF: 'Private Foundation',
    PBF: 'Public Foundation',
    QD: 'Qualified Donee',
  };

  // 5. Take first MAX_RECORDS (alphabetical order in source)
  const picked = candidates.slice(0, MAX_RECORDS);
  const records = picked.map((row) => {
    const cat = catCol ? trim(row[catCol]) : '';
    const ind = industryFromCraCat(cat);
    const desigCode = desigCol ? trim(row[desigCol]).toUpperCase() : '';
    const desigLabel = CRA_DESIG[desigCode] || (desigCode ? `CRA Type: ${desigCode}` : 'Registered Charity');
    const rec = {
      name: trim(row[nameCol]) || 'Registered charity',
      industry: ind.label,
      industryColor: ind.color,
      // MVP decision: name/type/status only — no dollar values
      exemType: desigLabel,
      rawValue: 0,
    };
    return rec;
  });

  return {
    jurisdiction_id: JURISDICTION_ID,
    data_source:
      'Canada Revenue Agency — Charities Directorate. Source: open.canada.ca. Licensed under Open Government Licence — Canada.',
    source_url: SOURCES.charities,
    note:
      'Ontario registered charities only. Name, type, and category displayed (MVP). No dollar values in this version. OGL-Canada.',
    total_in_source: candidates.length,
    records_stored: records.length,
    records,
  };
}

// ─── Grants (CV-DATA-014 — Ontario Transfer Payments) ────────────────────────

async function buildGrants() {
  // 1. Discover resources via data.ontario.ca CKAN API
  const pkg = await fetchJson(SOURCES.transferPaymentsCkanPkg);
  const resources = pkg?.result?.resources || [];

  // Pick most-recent English CSV (resources may be ordered oldest-first in CKAN package_show)
  const csvCandidates = resources.filter(
    (r) => trim(r.format).toUpperCase() === 'CSV' && /english/i.test(trim(r.language)),
  );
  csvCandidates.sort((a, b) =>
    (b.data_range_start || b.name || '').localeCompare(a.data_range_start || a.name || ''),
  );
  const csvRes =
    csvCandidates[0] ||
    resources.find((r) => trim(r.format).toUpperCase() === 'CSV') ||
    resources.find((r) => trim(r.url));

  if (!csvRes || !trim(csvRes.url)) {
    throw new Error(
      `Ontario Transfer Payments: no downloadable resource found. Resources: ${resources.map((r) => `${r.name || r.id} (${r.format})`).join(', ')}`,
    );
  }

  // 2. Download CSV (up to 20 MB)
  const csvUrl = trim(csvRes.url);
  const csvText = await fetchText(csvUrl, 20 * 1024 * 1024);
  const { headers, rows } = parseCsv(csvText);

  // 3. Detect columns dynamically
  // Current headers (2024-25): Amount $,Ministry,Category,Payment Detail,Recipient,Statutory,Additional Detail
  const recipientCol = headers.find((h) => /^recipient$/i.test(trim(h))) ||
    headers.find((h) => /recipient|beneficiar|payee/i.test(h));
  const amountCol = headers.find((h) => /^amount/i.test(trim(h))) ||
    headers.find((h) => /amount|montant/i.test(h));
  const ministryCol = headers.find((h) => /^ministry$/i.test(trim(h))) ||
    headers.find((h) => /ministry|ministère|dept|department/i.test(h));
  const programCol = headers.find((h) => /payment.detail/i.test(h)) ||
    headers.find((h) => /program/i.test(h));
  const typeCol = headers.find((h) => /^category$/i.test(trim(h))) ||
    headers.find((h) => /categ/i.test(h)) ||
    headers.find((h) => /type/i.test(h) && !/program/i.test(h));
  const fiscalCol = headers.find((h) => /fiscal.*year|year|année/i.test(h));
  const dateCol = headers.find((h) => /date/i.test(h));

  if (!recipientCol) {
    throw new Error(
      `Ontario Transfer Payments CSV: recipient column not found. Detected headers: ${headers.slice(0, 20).join(', ')}`,
    );
  }

  // 4. Mandatory category filter — approved decision 2026-08-15:
  // Use Category = "Transfer Payments" as the primary filter axis.
  // Payment Detail is NOT used as the primary filter because ~60% of valid transfer-payment
  // rows have Payment Detail = "No Value". The Category column cleanly separates transfer
  // payments from Other Payments, Travel Expenses, Statutory Payments, Salaries, and
  // Employee Benefits. Confirmed via full-dataset analysis of 15,571 rows.
  const categoryFilterApplied = !!typeCol;
  const withRecipient = rows.filter((r) => trim(r[recipientCol]));
  const all = categoryFilterApplied
    ? withRecipient.filter((r) => /^transfer payments$/i.test(trim(r[typeCol])))
    : withRecipient; // no Category column — warn but don't block

  if (!categoryFilterApplied) {
    console.warn('[buildGrants] WARNING: Category column not found — transfer-payment filter not applied. Review output before writing.');
  }

  if (amountCol) {
    all.sort((a, b) => parseMoneyish(b[amountCol] || '0') - parseMoneyish(a[amountCol] || '0'));
  }

  // 5. Take top MAX_RECORDS
  const top = all.slice(0, MAX_RECORDS);
  let totalRaw = 0;
  const records = top.map((row) => {
    const amt = amountCol ? parseMoneyish(row[amountCol] || '') : 0;
    totalRaw += amt;
    const typeRaw = typeCol ? trim(row[typeCol]) : '';
    return {
      recipientName: trim(row[recipientCol]) || 'Recipient',
      typeLabel: typeRaw || 'Organization',
      typeColor: 'bg-green-100 text-green-700',
      purpose: (programCol && trim(row[programCol]) && !/^no value$/i.test(trim(row[programCol])))
        ? trim(row[programCol])
        : (typeCol ? trim(row[typeCol]) || 'Transfer Payment' : 'Transfer Payment'),
      dept: ministryCol ? trim(row[ministryCol]) || 'Government of Ontario' : 'Government of Ontario',
      fmtAmount: fmtCompact(amt),
      rawAmount: amt,
      date: (fiscalCol && trim(row[fiscalCol])) || (dateCol && trim(row[dateCol])) || '',
    };
  });

  // The Ontario Public Accounts CSV has no fiscal year column — it's a single-year extract.
  // Use the CKAN resource name (e.g. "2024-2025") or date range metadata.
  const rangeStart = csvRes?.data_range_start || '';
  const rangeEnd = csvRes?.data_range_end || '';
  const rangeYear = rangeStart
    ? `${rangeStart.slice(0, 4)}-${rangeEnd.slice(2, 4)}`
    : trim(csvRes?.name || '');
  const inferredFiscalYear =
    (fiscalCol && rows[0] && trim(rows[0][fiscalCol])) || rangeYear || 'latest';

  return {
    jurisdiction_id: JURISDICTION_ID,
    fiscal_year: inferredFiscalYear,
    reporting_period: `Ontario Public Accounts — ${inferredFiscalYear}`,
    data_source:
      'Government of Ontario — Public Accounts: Detailed Schedule of Payments (data.ontario.ca). Ontario.ca Terms of Use.',
    source_url: SOURCES.transferPayments,
    note: categoryFilterApplied
      ? 'Top 100 Ontario transfer payments by amount. Filtered to Category = "Transfer Payments" only. Excludes: Other Payments, Travel Expenses, Statutory Payments, Salaries, Employee Benefits. Ontario.ca Terms of Use (not OGL-Ontario).'
      : 'Top 100 payments by amount. WARNING: category filter not applied (Category column missing). Ontario.ca Terms of Use (not OGL-Ontario). Review before display.',
    purpose_filter_applied: categoryFilterApplied,
    approved_purposes: categoryFilterApplied ? ['Transfer Payments'] : [],
    total_after_filter: all.length,
    records_stored: records.length,
    total_raw_top100: totalRaw,
    fmt_total_top100: fmtCompact(totalRaw),
    records,
  };
}

module.exports = {
  JURISDICTION_ID,
  SOURCES,
  buildEconomic,
  buildTax,
  buildGrants,
};
