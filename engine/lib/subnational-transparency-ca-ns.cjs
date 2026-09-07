/**
 * CA-NS (Nova Scotia) — official economic sources.
 *
 * unemployment  → subnational_economic_social_stats/CA-NS
 * CRA Charities → subnational_tax_exempt_entities/CA-NS
 * NS Grants     → subnational_grants/CA-NS — PARTIAL, see buildGrants() note.
 */

'use strict';

const {
  MAX_RECORDS,
  INDUSTRY_BADGE,
  trim,
  fmtCompact,
  parseMoneyish,
  fetchText,
  fetchJson,
  parseCsv,
} = require('./subnational-transparency-shared.cjs');
const {
  statcanProvincialUnemployment,
  STATCAN_CA_COORD,
} = require('./subnational-unemployment-monthly.cjs');

const JURISDICTION_ID = 'CA-NS';

// Statistics Canada Table 14-10-0287-01 — Nova Scotia geography dimension = 4
const STATCAN_NS_COORD = '4.7.1.1.1.1.0.0.0.0';

// Nova Scotia Open Data Portal (Socrata) base
const NS_SOCRATA_DOMAIN = 'data.novascotia.ca';
const NS_SOCRATA_CATALOG = 'https://api.us.socrata.com/api/catalog/v1';

const SOURCES = {
  unemployment: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410028701',
  // CRA Charities — same package as all provinces, filtered to NS
  charities: 'https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5',
  charitiesCkanPkg:
    'https://open.canada.ca/data/api/3/action/package_show?id=51c68b86-33f0-46fe-9b51-0a786d0088f5',
  // Nova Scotia's Department of Agriculture funding-by-recipient dataset — the
  // most substantial, actively-maintained, named-recipient grants dataset found
  // on data.novascotia.ca. See buildGrants() for why this is used and why it is
  // NOT a comprehensive whole-of-government source.
  agricultureFundingDataset: 'https://data.novascotia.ca/Business-and-Industry/Agriculture-Funding-Programs-Details/jv92-pedy',
  agricultureFundingSodaCsv: 'https://data.novascotia.ca/resource/jv92-pedy.csv',
};

// ─── Economic (Statistics Canada LFS unemployment) ────────────────────────────

async function buildEconomic() {
  const out = {
    jurisdiction_id: JURISDICTION_ID,
    reporting_period: 'Monthly provincial unemployment (Statistics Canada LFS)',
  };
  const notes = [];

  try {
    const unemp = await statcanProvincialUnemployment(
      STATCAN_NS_COORD,
      STATCAN_CA_COORD,
      'Nova Scotia',
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

// ─── Tax / Charities (CRA Charities Registry) ─────────────────────────────────

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
  const pkg = await fetchJson(SOURCES.charitiesCkanPkg);
  const resources = pkg?.result?.resources || [];
  const csvRes =
    resources.find((r) => /ident/i.test(trim(r.name)) && trim(r.format).toUpperCase() === 'CSV') ||
    resources.find((r) => /ident/i.test(trim(r.url).toLowerCase())) ||
    resources.find((r) => trim(r.format).toUpperCase() === 'CSV');
  if (!csvRes || !trim(csvRes.url)) {
    throw new Error(
      `CRA Charities: no CSV resource found. Resources: ${resources.map((r) => `${r.name || r.id} (${r.format})`).join(', ')}`,
    );
  }

  const csvUrl = trim(csvRes.url);
  const csvText = await fetchText(csvUrl, 50 * 1024 * 1024);
  const { headers, rows } = parseCsv(csvText);

  const provCol = headers.find((h) => /^province$/i.test(trim(h))) ||
    headers.find((h) => /province/i.test(h));
  const nameCol = headers.find((h) => /legal.name/i.test(trim(h))) ||
    headers.find((h) => /^name$/i.test(trim(h))) ||
    headers.find((h) => /name|nom/i.test(h) && !/province|contact|account/i.test(h));
  const catCol = headers.find((h) => /categ/i.test(h));
  const desigCol = headers.find((h) => /designat/i.test(h));

  if (!provCol || !nameCol) {
    throw new Error(
      `CRA Charities CSV: required columns not found. Headers: ${headers.slice(0, 20).join(', ')}`,
    );
  }

  const candidates = [];
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const prov = trim(row[provCol]).toUpperCase();
    if (prov !== 'NS' && prov !== 'NOVA SCOTIA') continue;
    candidates.push(row);
  }

  const CRA_DESIG = {
    A: 'Public Foundation',
    B: 'Private Foundation',
    C: 'Charitable Organization',
    PF: 'Private Foundation',
    PBF: 'Public Foundation',
    QD: 'Qualified Donee',
  };

  const picked = candidates.slice(0, MAX_RECORDS);
  const records = picked.map((row) => {
    const cat = catCol ? trim(row[catCol]) : '';
    const ind = industryFromCraCat(cat);
    const desigCode = desigCol ? trim(row[desigCol]).toUpperCase() : '';
    const desigLabel = CRA_DESIG[desigCode] || (desigCode ? `CRA Type: ${desigCode}` : 'Registered Charity');
    return {
      name: trim(row[nameCol]) || 'Registered charity',
      industry: ind.label,
      industryColor: ind.color,
      exemType: desigLabel,
      rawValue: 0,
    };
  });

  return {
    jurisdiction_id: JURISDICTION_ID,
    data_source:
      'Canada Revenue Agency — Charities Directorate. Source: open.canada.ca. Licensed under Open Government Licence — Canada.',
    source_url: SOURCES.charities,
    note:
      'NS registered charities only. Name, type, and category displayed (MVP). No dollar values in this version. OGL-Canada.',
    total_in_source: candidates.length,
    records_stored: records.length,
    records,
  };
}

// ─── Grants — PARTIAL (single-department dataset) ─────────────────────────────

/**
 * Nova Scotia has no CKAN-based open data portal — it runs a Socrata-powered
 * open data platform (data.novascotia.ca, ~1,277 datasets), a different
 * platform than BC/AB/Québec's CKAN portals.
 *
 * A thorough search of the Nova Scotia Socrata catalog (search API scoped to
 * domains=data.novascotia.ca, plus browsing category facets) found NO
 * comprehensive, whole-of-government grants/payments/public-accounts dataset
 * comparable to BC's supplier payments, Alberta's grant disclosure, Ontario's
 * detailed schedule of payments, or even Québec's category-level Public
 * Accounts Volume 2. Search terms tried: "grants payments", "public accounts",
 * "transfer payments", "supplier payments", "vendor payments", "expenditure",
 * "detailed schedule of payments", "proactive disclosure", "disclosure of
 * contracts", "sunshine list", "salary disclosure", "compensation disclosure",
 * "public accounts volume" — none returned a comprehensive government-wide
 * payments/grants dataset.
 *
 * What DOES exist is a set of narrow, single-program grant-recipient datasets,
 * each covering only one department's funding program(s):
 *   - Agriculture Funding Programs Details (jv92-pedy) — Department of
 *     Agriculture, 6,324 rows, real recipient names + payment amounts,
 *     actively maintained (a separate id, hp9q-92dp, is an [ARCHIVED] older
 *     version and was not used).
 *   - Nova Scotia Mineral Resources Development Fund (MRDF) Grant Recipients
 *     (iz26-kkmn) — Natural Resources, mining-sector grants only.
 *   - Age-Friendly Communities Grant Funding Recipients (izys-5emb) — single
 *     grant program.
 *   - Applicants and Recipients of Small Business Impact Grant / Small
 *     Business Reopening and Support Grant (xaty-cfpq) — one-time COVID-era
 *     programs.
 *   - Operating Grant Assistance to University and NSCC (jivi-kv67) —
 *     post-secondary institutional operating grants only.
 *
 * This module fetches the Agriculture Funding Programs Details dataset
 * (the largest, most complete, currently-maintained, named-recipient dataset
 * found) as a REPRESENTATIVE SAMPLE to prove the pipeline works end-to-end —
 * it is real, unaltered, licensed open data (Nova Scotia Open Government
 * Licence). It is explicitly NOT presented as "Nova Scotia grants" in
 * general — the dataset covers Department of Agriculture funding programs
 * only, and does not represent government-wide spending. A reviewer must
 * decide whether a single-department dataset is acceptable to publish under
 * the standard province-wide Grants/Transfer Payments UI pattern (and with
 * what label/caveat), whether to combine multiple narrow NS datasets, or
 * whether to wait for Nova Scotia to publish a comprehensive source.
 */
async function buildGrants() {
  const csvText = await fetchText(SOURCES.agricultureFundingSodaCsv + '?$limit=50000', 20 * 1024 * 1024);
  const { headers, rows } = parseCsv(csvText);

  const deptCol = headers.find((h) => /^department$/i.test(trim(h))) || headers[0];
  const divisionCol = headers.find((h) => /^division$/i.test(trim(h)));
  const programCol = headers.find((h) => /program.name/i.test(trim(h)));
  const clientCol = headers.find((h) => /client.name/i.test(trim(h)));
  const amountCol = headers.find((h) => /payment.amount/i.test(trim(h)));
  const yearCol = headers.find((h) => /fiscal.year/i.test(trim(h)));

  if (!clientCol || !amountCol) {
    throw new Error(
      `NS Agriculture Funding CSV: expected columns not found. Headers: ${headers.join(', ')}. ` +
      `Source: ${SOURCES.agricultureFundingSodaCsv}`,
    );
  }

  const totalRows = rows.length;
  const withClient = rows.filter((r) => trim(r[clientCol]));
  const blankClientCount = totalRows - withClient.length;

  withClient.sort((a, b) => parseMoneyish(b[amountCol] || '0') - parseMoneyish(a[amountCol] || '0'));

  const top = withClient.slice(0, MAX_RECORDS);
  let totalRaw = 0;
  const records = top.map((row) => {
    const amt = parseMoneyish(row[amountCol] || '');
    totalRaw += amt;
    return {
      recipientName: trim(row[clientCol]) || 'Recipient',
      typeLabel: 'Grant',
      typeColor: 'bg-green-100 text-green-700',
      purpose: (programCol && trim(row[programCol])) || 'Agriculture Funding Program',
      dept: (deptCol && trim(row[deptCol])) || 'Department of Agriculture',
      fmtAmount: fmtCompact(amt),
      rawAmount: amt,
      date: (yearCol && trim(row[yearCol])) || '',
    };
  });

  const warnings = [
    'SCOPE WARNING: this dataset covers Nova Scotia Department of Agriculture funding programs ONLY — it is ' +
    'not a comprehensive, whole-of-government grants/payments dataset. No comprehensive Nova Scotia source was ' +
    'found (see module header comment for the full search performed). Several other narrow single-program ' +
    'Nova Scotia grant-recipient datasets exist (mineral resources, age-friendly communities, small business ' +
    'COVID grants, university operating grants) but were not combined into this dataset — that would be a ' +
    'product decision requiring reviewer sign-off, not made unilaterally here.',
  ];
  if (blankClientCount > 0) {
    warnings.push(`${blankClientCount} row(s) had no recipient name and were excluded.`);
  }

  return {
    jurisdiction_id: JURISDICTION_ID,
    fiscal_year: 'multi-year (2018-2019 onward)',
    reporting_period: 'Nova Scotia Department of Agriculture — Agriculture Funding Programs Details, multi-year (2018-2019 onward)',
    data_source: 'Government of Nova Scotia — Department of Agriculture — Agriculture Funding Programs Details. Nova Scotia Open Government Licence.',
    data_source_scope_note: 'Department of Agriculture funding programs only — not a whole-of-government dataset.',
    source_url: SOURCES.agricultureFundingDataset,
    resource_url: SOURCES.agricultureFundingSodaCsv,
    licence: 'Nova Scotia Open Government Licence',
    licence_url: 'http://novascotia.ca/opendata/licence.asp',
    note: `Top ${MAX_RECORDS} Nova Scotia Department of Agriculture funding payments by amount, multi-year. ` +
      'This is a single-department dataset, not a comprehensive provincial grants/payments source — see warnings.',
    total_rows_in_source: totalRows,
    blank_recipient_rows_excluded: blankClientCount,
    total_after_filter: withClient.length,
    records_stored: records.length,
    total_raw_top100: totalRaw,
    fmt_total_top100: fmtCompact(totalRaw),
    detected_columns: {
      department: deptCol || null,
      division: divisionCol || null,
      program: programCol || null,
      recipient: clientCol || null,
      amount: amountCol || null,
      fiscal_year: yearCol || null,
    },
    all_headers: headers.slice(0, 30),
    raw_first_rows: rows.slice(0, 5).map((r) => Object.fromEntries(
      headers.map((h) => [h, trim(r[h])]),
    )),
    warnings,
    records,
  };
}

module.exports = {
  JURISDICTION_ID,
  STATCAN_NS_COORD,
  SOURCES,
  buildEconomic,
  buildTax,
  buildGrants,
};
