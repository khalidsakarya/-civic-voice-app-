/**
 * Subnational jurisdiction transparency payloads.
 * Sources: embedded fields on `subnational_jurisdictions`, or dedicated modal collections
 * (`subnational_economic_social_stats`, `subnational_tax_exempt_entities`, `subnational_grants`)
 * keyed by jurisdiction id (e.g. `CA-ON`). UI uses parsed rows only — no demo RNG.
 */

const BUDGET_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const INDUSTRY_BADGE_COLORS = {
  Technology: 'bg-blue-100 text-blue-700',
  Healthcare: 'bg-green-100 text-green-700',
  Manufacturing: 'bg-orange-100 text-orange-700',
  Energy: 'bg-amber-100 text-amber-700',
  'Real Estate': 'bg-purple-100 text-purple-700',
  Finance: 'bg-indigo-100 text-indigo-700',
  Retail: 'bg-pink-100 text-pink-700',
  Agriculture: 'bg-lime-100 text-lime-700',
  Mining: 'bg-stone-100 text-stone-600',
  Transportation: 'bg-cyan-100 text-cyan-700',
  Construction: 'bg-yellow-100 text-yellow-700',
  Utilities: 'bg-teal-100 text-teal-700',
  'Food & Beverage': 'bg-red-100 text-red-700',
  Pharmaceutical: 'bg-emerald-100 text-emerald-700',
  Aerospace: 'bg-sky-100 text-sky-700',
};

const GRANT_TYPE_COLORS = {
  Organization: 'bg-green-100 text-green-700',
  Company: 'bg-blue-100 text-blue-700',
  Individual: 'bg-purple-100 text-purple-700',
};

/** Shown when Firestore has no usable period metadata for a modal doc. */
export const REPORTING_PERIOD_NOT_SPECIFIED =
  'Reporting period: not specified in source metadata.';

const PERIOD_FIELD_KEYS = [
  'reporting_period',
  'reportingPeriod',
  'fiscal_year',
  'fiscalYear',
  'data_year',
  'dataYear',
  'source_year',
  'sourceYear',
];

/** @param {unknown} v */
function trimStr(v) {
  if (v == null) return '';
  return String(v).trim();
}

/** @param {unknown} v */
function numOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** @param {string} flagCode e.g. `ca-on`, `us-tx` */
function abbreviationFromExplorerFlagCode(flagCode) {
  if (!flagCode || typeof flagCode !== 'string') return '';
  const parts = flagCode.split('-');
  return (parts[parts.length - 1] || '').toUpperCase();
}

/**
 * @param {Record<string, unknown>|null|undefined} item
 * @param {boolean} isUSA
 * @returns {string}
 */
export function subnationalTransparencyJurisdictionId(item, isUSA) {
  if (!item || typeof item !== 'object') return '';
  const fromId = trimStr(item.subnationalId);
  if (fromId) return fromId;
  const country =
    trimStr(item.subnationalCountry) || (isUSA ? 'US' : 'CA');
  const abbr =
    trimStr(item.subnationalAbbreviation) ||
    abbreviationFromExplorerFlagCode(String(item.flagCode || ''));
  if (abbr) return `${country}-${abbr.toUpperCase()}`;
  return '';
}

/** @param {unknown} raw */
function transparencyBundleFromRaw(raw) {
  if (!raw || typeof raw !== 'object') {
    return { economic: null, tax: null, grants: null, sourceName: '', sourceUrl: '' };
  }
  const nested =
    raw.transparency && typeof raw.transparency === 'object' && !Array.isArray(raw.transparency)
      ? raw.transparency
      : null;
  return {
    economic:
      raw.economic_social_data ??
      raw.economicSocialData ??
      nested?.economic_social_data ??
      nested?.economicSocialData ??
      nested?.economic ??
      null,
    tax:
      raw.tax_exempt_companies ??
      raw.taxExemptCompanies ??
      nested?.tax_exempt_companies ??
      nested?.taxExemptCompanies ??
      null,
    grants:
      raw.grants_given ??
      raw.grantsGiven ??
      nested?.grants_given ??
      nested?.grantsGiven ??
      null,
    sourceName:
      trimStr(raw.transparency_source_name) ||
      trimStr(nested?.source_name) ||
      trimStr(raw.source_name),
    sourceUrl:
      trimStr(raw.transparency_source_url) ||
      trimStr(nested?.source_url) ||
      trimStr(raw.source_url),
  };
}

/** @param {unknown} row @param {number} i */
function normalizeBudgetRow(row, i) {
  if (!row || typeof row !== 'object') return null;
  const name = trimStr(row.name ?? row.category ?? row.label);
  const value = numOrNull(row.value ?? row.share ?? row.percent);
  if (!name || value == null) return null;
  const color = trimStr(row.color) || BUDGET_COLORS[i % BUDGET_COLORS.length];
  return { name, value, color };
}

/** @param {unknown} row */
function normalizeSpendRow(row) {
  if (!row || typeof row !== 'object') return null;
  const category = trimStr(row.category ?? row.name);
  const allocated = numOrNull(row.Allocated ?? row.allocated ?? row.budget);
  const actual = numOrNull(row.Actual ?? row.actual ?? row.spent);
  if (!category || allocated == null || actual == null) return null;
  return { category, Allocated: allocated, Actual: actual };
}

/** @param {unknown} row */
function normalizeYearSeriesRow(row, valueKeys) {
  if (!row || typeof row !== 'object') return null;
  const year = trimStr(row.year);
  if (!year) return null;
  const out = { year };
  let hasValue = false;
  for (let i = 0; i < valueKeys.length; i += 1) {
    const k = valueKeys[i];
    const v = numOrNull(row[k]);
    if (v != null) {
      out[k] = v;
      hasValue = true;
    }
  }
  return hasValue ? out : null;
}

/**
 * @param {unknown} rows
 * @param {string} jurisdictionName
 * @param {boolean} isUSA
 */
function normalizeUnemploymentRows(rows, jurisdictionName, isUSA) {
  if (!Array.isArray(rows) || !rows.length) return { unempData: [], unempKeys: [] };
  const natKey = `${isUSA ? 'US' : 'CA'} Average`;
  const unempData = [];
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row || typeof row !== 'object') continue;
    const year = trimStr(row.year);
    if (!year) continue;
    const jVal =
      numOrNull(row.jurisdiction) ??
      numOrNull(row.jurisdiction_rate) ??
      numOrNull(row.state_rate) ??
      numOrNull(row[jurisdictionName]);
    const nVal =
      numOrNull(row.national_average) ??
      numOrNull(row.nationalAverage) ??
      numOrNull(row[natKey]);
    if (jVal == null && nVal == null) continue;
    const point = { year };
    if (jVal != null) point[jurisdictionName] = jVal;
    if (nVal != null) point[natKey] = nVal;
    unempData.push(point);
  }
  return {
    unempData,
    unempKeys: unempData.length ? [jurisdictionName, natKey] : [],
  };
}

/** @param {Record<string, unknown>} row @param {string[]} keys */
function pickNumFromRow(row, keys) {
  for (let i = 0; i < keys.length; i += 1) {
    const v = numOrNull(row[keys[i]]);
    if (v != null) return v;
  }
  return null;
}

const CRIME_VIOLENT_CSI_KEYS = ['Violent CSI', 'violent_csi'];
const CRIME_PROPERTY_CSI_KEYS = [
  'Non-violent CSI',
  'Non-Violent CSI',
  'non_violent_csi',
  'non-violent_csi',
];
const CRIME_VIOLENT_RATE_KEYS = ['Violent Crime', 'violent_crime'];
const CRIME_PROPERTY_RATE_KEYS = ['Property Crime', 'property_crime'];

/**
 * Normalize crime series from Firestore (CSI or per-capita incident keys).
 * @param {unknown} crimeRaw
 * @returns {{
 *   crimeDataM: Array<Record<string, unknown>>;
 *   crimeMetricType: 'csi' | 'incident_rate';
 *   crimeViolentKey: string;
 *   crimePropertyKey: string;
 * }}
 */
function normalizeCrimeSeries(crimeRaw) {
  const empty = {
    crimeDataM: [],
    crimeMetricType: 'incident_rate',
    crimeViolentKey: 'Violent Crime',
    crimePropertyKey: 'Property Crime',
  };
  if (!Array.isArray(crimeRaw) || !crimeRaw.length) return empty;

  let isCsi = false;
  for (let i = 0; i < crimeRaw.length; i += 1) {
    const row = crimeRaw[i];
    if (!row || typeof row !== 'object') continue;
    if (
      pickNumFromRow(row, CRIME_VIOLENT_CSI_KEYS) != null ||
      pickNumFromRow(row, CRIME_PROPERTY_CSI_KEYS) != null
    ) {
      isCsi = true;
      break;
    }
  }

  const violentKey = isCsi ? 'Violent CSI' : 'Violent Crime';
  const propertyKey = isCsi ? 'Non-violent CSI' : 'Property Crime';
  const violentPick = isCsi ? CRIME_VIOLENT_CSI_KEYS : CRIME_VIOLENT_RATE_KEYS;
  const propertyPick = isCsi ? CRIME_PROPERTY_CSI_KEYS : CRIME_PROPERTY_RATE_KEYS;

  const crimeData = [];
  for (let i = 0; i < crimeRaw.length; i += 1) {
    const row = crimeRaw[i];
    if (!row || typeof row !== 'object') continue;
    const year = trimStr(row.year);
    if (!year) continue;
    const violent = pickNumFromRow(row, violentPick);
    const property = pickNumFromRow(row, propertyPick);
    if (violent == null && property == null) continue;
    const point = { year };
    if (violent != null) point[violentKey] = violent;
    if (property != null) point[propertyKey] = property;
    crimeData.push(point);
  }

  if (!crimeData.length) return empty;

  return {
    crimeDataM: crimeData.slice(-6),
    crimeMetricType: isCsi ? 'csi' : 'incident_rate',
    crimeViolentKey: violentKey,
    crimePropertyKey: propertyKey,
  };
}

/**
 * @param {unknown} raw
 * @param {string} jurisdictionName
 * @param {boolean} isUSA
 */
export function parseSubnationalEconomicSocialData(raw, jurisdictionName, isUSA) {
  const bundle = transparencyBundleFromRaw(raw);
  const src = bundle.economic;
  if (!src || typeof src !== 'object') {
    return {
      hasData: false,
      budgetData: [],
      spendData: [],
      crimeDataM: [],
      crimeMetricType: 'incident_rate',
      crimeViolentKey: 'Violent Crime',
      crimePropertyKey: 'Property Crime',
      unempData: [],
      unempKeys: [],
      gdpDataM: [],
      povDataM: [],
      homelessData: [],
      sourceName: bundle.sourceName,
      sourceUrl: bundle.sourceUrl,
    };
  }

  const budgetRaw = src.budget_distribution ?? src.budgetDistribution ?? src.budget;
  const budgetData = Array.isArray(budgetRaw)
    ? budgetRaw.map((r, i) => normalizeBudgetRow(r, i)).filter(Boolean)
    : [];

  const spendRaw = src.spending_vs_budget ?? src.spendingVsBudget ?? src.spending;
  const spendData = Array.isArray(spendRaw)
    ? spendRaw.map((r) => normalizeSpendRow(r)).filter(Boolean)
    : [];

  const crimeRaw =
    src.crime_rate_trends ?? src.crimeRateTrends ?? src.crime_rate ?? src.crime;
  const {
    crimeDataM,
    crimeMetricType,
    crimeViolentKey,
    crimePropertyKey,
  } = normalizeCrimeSeries(crimeRaw);

  const unempRaw = src.unemployment_rate ?? src.unemploymentRate ?? src.unemployment;
  const { unempData, unempKeys } = normalizeUnemploymentRows(unempRaw, jurisdictionName, isUSA);

  const gdpRaw = src.gdp_growth ?? src.gdpGrowth ?? src.gdp;
  const gdpData = Array.isArray(gdpRaw)
    ? gdpRaw
        .map((r) => normalizeYearSeriesRow(r, ['GDP Growth (%)', 'gdp_growth', 'growth']))
        .filter(Boolean)
        .map((r) => ({
          year: r.year,
          'GDP Growth (%)': r['GDP Growth (%)'] ?? r.gdp_growth ?? r.growth,
        }))
        .filter((r) => r['GDP Growth (%)'] != null)
    : [];
  const gdpDataM = gdpData.slice(-6);

  const povRaw = src.poverty_rate ?? src.povertyRate ?? src.poverty;
  const povData = Array.isArray(povRaw)
    ? povRaw
        .map((r) => normalizeYearSeriesRow(r, ['Poverty Rate (%)', 'poverty_rate', 'rate']))
        .filter(Boolean)
        .map((r) => ({
          year: r.year,
          'Poverty Rate (%)': r['Poverty Rate (%)'] ?? r.poverty_rate ?? r.rate,
        }))
        .filter((r) => r['Poverty Rate (%)'] != null)
    : [];
  const povDataM = povData.slice(-6);

  const homelessRaw = src.homelessness ?? src.homeless;
  const homelessData = Array.isArray(homelessRaw)
    ? homelessRaw
        .map((r) => {
          if (!r || typeof r !== 'object') return null;
          const year = trimStr(r.year);
          const sheltered = numOrNull(r.Sheltered ?? r.sheltered);
          const unsheltered = numOrNull(r.Unsheltered ?? r.unsheltered);
          if (!year || sheltered == null || unsheltered == null) return null;
          return { year, Sheltered: sheltered, Unsheltered: unsheltered };
        })
        .filter(Boolean)
    : [];

  const hasData =
    budgetData.length > 0 ||
    spendData.length > 0 ||
    crimeDataM.length > 0 ||
    unempData.length > 0 ||
    gdpDataM.length > 0 ||
    povDataM.length > 0 ||
    homelessData.length > 0;

  return {
    hasData,
    budgetData,
    spendData,
    crimeDataM,
    crimeMetricType,
    crimeViolentKey,
    crimePropertyKey,
    unempData,
    unempKeys,
    gdpDataM,
    povDataM,
    homelessData,
    sourceName: trimStr(src.source_name) || bundle.sourceName,
    sourceUrl: trimStr(src.source_url) || bundle.sourceUrl,
  };
}

/** @param {number} rawValue */
export function formatCurrencyCompact(rawValue) {
  if (!Number.isFinite(rawValue)) return '—';
  const abs = Math.abs(rawValue);
  if (abs >= 1_000_000_000) return `$${(rawValue / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(rawValue / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(rawValue / 1_000).toFixed(0)}K`;
  return `$${rawValue.toLocaleString()}`;
}

/** @param {unknown} row */
function normalizeTaxExemptRow(row) {
  if (!row || typeof row !== 'object') return null;
  const name = trimStr(row.name ?? row.company_name ?? row.companyName);
  if (!name) return null;
  const industry = trimStr(row.industry) || 'Other';
  const exemType =
    trimStr(row.exemType ?? row.exemption_type ?? row.exemptionType) || 'Tax exemption';
  const rawValue =
    numOrNull(row.rawValue ?? row.annual_value ?? row.annualValue ?? row.value ?? row.amount) ??
    0;
  const fmtFromDoc = trimStr(row.fmtValue);
  const yearRaw = row.year_granted ?? row.yearGranted ?? row.year;
  const year = yearRaw != null && String(yearRaw).trim() ? String(yearRaw).trim() : '—';
  return {
    name,
    industry,
    industryColor:
      trimStr(row.industryColor) ||
      INDUSTRY_BADGE_COLORS[industry] ||
      'bg-gray-100 text-gray-700',
    exemType,
    fmtValue: fmtFromDoc || formatCurrencyCompact(rawValue),
    rawValue,
    year,
  };
}

/** @param {unknown} raw */
export function parseSubnationalTaxExemptCompanies(raw) {
  const bundle = transparencyBundleFromRaw(raw);
  const rows = bundle.tax;
  if (!Array.isArray(rows) || !rows.length) {
    return { companies: [], sourceName: bundle.sourceName, sourceUrl: bundle.sourceUrl };
  }
  const companies = [];
  for (let i = 0; i < rows.length; i += 1) {
    const normalized = normalizeTaxExemptRow(rows[i]);
    if (normalized) companies.push(normalized);
  }
  return {
    companies,
    sourceName: bundle.sourceName,
    sourceUrl: bundle.sourceUrl,
  };
}

/**
 * `subnational_tax_exempt_entities/{jurisdictionId}` document.
 * @param {Record<string, unknown>|null|undefined} doc
 */
export function parseSubnationalTaxFromEntitiesDoc(doc) {
  if (!doc || typeof doc !== 'object') {
    return { companies: [], sourceName: '', sourceUrl: '' };
  }
  const rows = Array.isArray(doc.records) ? doc.records : [];
  const companies = rows.map((r) => normalizeTaxExemptRow(r)).filter(Boolean);
  return {
    companies,
    sourceName: trimStr(doc.data_source) || trimStr(doc.source_name),
    sourceUrl: trimStr(doc.source_url) || trimStr(doc.cra_search_url),
  };
}

/** @param {unknown} row */
function normalizeGrantRow(row) {
  if (!row || typeof row !== 'object') return null;
  const recipientName =
    trimStr(row.recipientName ?? row.recipient_name ?? row.recipient ?? row.name) ||
    trimStr(row.program_name ?? row.programName);
  if (!recipientName) return null;
  const typeLabel =
    trimStr(row.typeLabel ?? row.recipient_type ?? row.recipientType ?? row.type) || 'Grant';
  const typeColor =
    trimStr(row.typeColor) || GRANT_TYPE_COLORS[typeLabel] || 'bg-gray-100 text-gray-700';
  const purpose =
    trimStr(row.purpose ?? row.program_name ?? row.programName ?? row.description) || '—';
  const dept =
    trimStr(row.dept ?? row.funding_department ?? row.fundingDepartment ?? row.department ?? row.agency) ||
    '—';
  const rawAmount =
    numOrNull(row.rawAmount ?? row.amount ?? row.award_amount ?? row.awardAmount) ?? 0;
  const fmtFromDoc = trimStr(row.fmtAmount);
  const date =
    trimStr(row.date ?? row.award_date ?? row.awardDate) ||
    (row.year != null ? String(row.year) : '—');
  return {
    recipientName,
    typeLabel,
    typeColor,
    purpose,
    fmtAmount: fmtFromDoc || formatCurrencyCompact(rawAmount),
    rawAmount,
    date,
    dept,
  };
}

/** @param {unknown} raw */
export function parseSubnationalGrantsGiven(raw) {
  const bundle = transparencyBundleFromRaw(raw);
  const rows = bundle.grants;
  if (!Array.isArray(rows) || !rows.length) {
    return { grants: [], sourceName: bundle.sourceName, sourceUrl: bundle.sourceUrl };
  }
  const grants = [];
  for (let i = 0; i < rows.length; i += 1) {
    const normalized = normalizeGrantRow(rows[i]);
    if (normalized) grants.push(normalized);
  }
  return {
    grants,
    sourceName: bundle.sourceName,
    sourceUrl: bundle.sourceUrl,
  };
}

/**
 * `subnational_grants/{jurisdictionId}` document.
 * @param {Record<string, unknown>|null|undefined} doc
 */
export function parseSubnationalGrantsFromGrantsDoc(doc) {
  if (!doc || typeof doc !== 'object') {
    return { grants: [], sourceName: '', sourceUrl: '' };
  }
  const rows = Array.isArray(doc.records) ? doc.records : [];
  const grants = rows.map((r) => normalizeGrantRow(r)).filter(Boolean);
  return {
    grants,
    sourceName: trimStr(doc.data_source) || trimStr(doc.source_name),
    sourceUrl: trimStr(doc.source_url),
  };
}

/**
 * `subnational_economic_social_stats/{jurisdictionId}` — series live at document top level.
 * @param {Record<string, unknown>|null|undefined} doc
 * @param {string} jurisdictionName
 * @param {boolean} isUSA
 */
export function parseSubnationalEconomicSocialFromStatsDoc(doc, jurisdictionName, isUSA) {
  if (!doc || typeof doc !== 'object') {
    return parseSubnationalEconomicSocialData(null, jurisdictionName, isUSA);
  }
  const wrapped = {
    economic_social_data: {
      budget_distribution: doc.budget_distribution,
      spending_vs_budget: doc.spending_vs_budget,
      crime_rate_trends: doc.crime_rate_trends ?? doc.crime_rate,
      unemployment_rate: doc.unemployment_rate,
      gdp_growth: doc.gdp_growth,
      poverty_rate: doc.poverty_rate,
      homelessness: doc.homelessness,
      source_name: doc.budget_distribution_source || doc.unemployment_source,
      source_url: doc.budget_distribution_url || doc.unemployment_url,
    },
    transparency_source_name: doc.budget_distribution_source,
    transparency_source_url: doc.budget_distribution_url,
    source_name: doc.budget_distribution_source,
    source_url: doc.budget_distribution_url,
  };
  return parseSubnationalEconomicSocialData(wrapped, jurisdictionName, isUSA);
}

/** @param {Record<string, unknown>} doc */
function pickExplicitPeriodFromDoc(doc) {
  for (let i = 0; i < PERIOD_FIELD_KEYS.length; i += 1) {
    const k = PERIOD_FIELD_KEYS[i];
    const v = trimStr(doc[k]);
    if (v) return v;
  }
  return '';
}

/** @param {string} raw */
function formatExplicitPeriodLabel(raw) {
  const s = trimStr(raw);
  if (!s) return '';
  if (/^fy[\s-]/i.test(s)) return s;
  if (/^\d{4}[-–]\d{2,4}$/.test(s)) return `FY ${s}`;
  if (/^\d{4}$/.test(s)) return `Calendar year ${s}`;
  return s;
}

/**
 * Human-readable reporting period from a dedicated modal Firestore document.
 * @param {Record<string, unknown>|null|undefined} doc
 * @param {'economic'|'tax'|'grants'} kind
 * @returns {string}
 */
export function reportingPeriodLineFromModalDoc(doc, kind) {
  if (!doc || typeof doc !== 'object') {
    return REPORTING_PERIOD_NOT_SPECIFIED;
  }

  const explicit = pickExplicitPeriodFromDoc(doc);
  if (explicit) {
    return `Reporting period: ${formatExplicitPeriodLabel(explicit)}`;
  }

  if (kind === 'economic') {
    const budgetSrc = trimStr(doc.budget_distribution_source);
    const spendSrc = trimStr(doc.spending_source);
    const primary = budgetSrc || spendSrc;
    if (primary) {
      return `Reporting period: ${primary}`;
    }
  }

  if (kind === 'tax') {
    const dataSource = trimStr(doc.data_source) || trimStr(doc.source);
    if (dataSource) {
      return `Reporting period: ${dataSource}`;
    }
    const records = Array.isArray(doc.records) ? doc.records : [];
    if (records.length) {
      const years = new Set();
      for (let i = 0; i < records.length; i += 1) {
        const y = records[i]?.year;
        if (y != null && String(y).trim()) years.add(String(y).trim());
      }
      if (years.size === 1) {
        const y = [...years][0];
        return `Reporting period: CRA registered charities snapshot (${y} list)`;
      }
    }
  }

  if (kind === 'grants') {
    const dataSource = trimStr(doc.data_source) || trimStr(doc.source);
    if (dataSource && trimStr(doc.note)) {
      return `Reporting period: ${dataSource} (${trimStr(doc.note)})`;
    }
    if (dataSource) {
      return `Reporting period: ${dataSource}`;
    }
  }

  return REPORTING_PERIOD_NOT_SPECIFIED;
}

/**
 * @param {{
 *   economicDoc?: Record<string, unknown>|null;
 *   taxDoc?: Record<string, unknown>|null;
 *   grantsDoc?: Record<string, unknown>|null;
 * }} docs
 * @param {string} jurisdictionName
 * @param {boolean} isUSA
 */
export function buildTransparencyFieldsFromModalDocs(docs, jurisdictionName, isUSA) {
  const economic = parseSubnationalEconomicSocialFromStatsDoc(
    docs?.economicDoc || null,
    jurisdictionName,
    isUSA,
  );
  const tax = parseSubnationalTaxFromEntitiesDoc(docs?.taxDoc || null);
  const grants = parseSubnationalGrantsFromGrantsDoc(docs?.grantsDoc || null);
  const sourceName =
    trimStr(economic.sourceName) || trimStr(tax.sourceName) || trimStr(grants.sourceName);
  const sourceUrl =
    trimStr(economic.sourceUrl) || trimStr(tax.sourceUrl) || trimStr(grants.sourceUrl);
  const out = {};
  if (economic.hasData) {
    out.subnationalEconomicSocial = economic;
    out.subnationalEconomicReportingPeriod = reportingPeriodLineFromModalDoc(
      docs?.economicDoc || null,
      'economic',
    );
  }
  if (tax.companies.length) {
    out.subnationalTaxExemptCompanies = tax.companies;
    out.subnationalTaxReportingPeriod = reportingPeriodLineFromModalDoc(
      docs?.taxDoc || null,
      'tax',
    );
  }
  if (grants.grants.length) {
    out.subnationalGrantsGiven = grants.grants;
    out.subnationalGrantsReportingPeriod = reportingPeriodLineFromModalDoc(
      docs?.grantsDoc || null,
      'grants',
    );
  }
  if (sourceName) out.subnationalTransparencySourceName = sourceName;
  if (sourceUrl) out.subnationalTransparencySourceUrl = sourceUrl;
  return out;
}

/**
 * Pass Firestore transparency payloads through on normalized rows (parsed at merge/UI).
 * @param {Record<string, unknown>} rec
 * @param {Record<string, unknown>} raw
 */
export function passThroughSubnationalTransparencyFields(rec, raw) {
  if (!rec || !raw) return;
  const bundle = transparencyBundleFromRaw(raw);
  if (bundle.economic != null) rec.economic_social_data = bundle.economic;
  if (Array.isArray(bundle.tax) && bundle.tax.length) rec.tax_exempt_companies = bundle.tax;
  if (Array.isArray(bundle.grants) && bundle.grants.length) rec.grants_given = bundle.grants;
  if (bundle.sourceName) rec.transparency_source_name = bundle.sourceName;
  if (bundle.sourceUrl) rec.transparency_source_url = bundle.sourceUrl;
}

/**
 * Read transparency from merged explorer `selectedProvince` row.
 * @param {Record<string, unknown>|null|undefined} item
 * @param {boolean} isUSA
 */
export function economicSocialFromExplorerItem(item, isUSA) {
  if (!item) {
    return parseSubnationalEconomicSocialData(null, '', isUSA);
  }
  if (item.subnationalEconomicSocial?.hasData) {
    return item.subnationalEconomicSocial;
  }
  return parseSubnationalEconomicSocialData(
    {
      economic_social_data: item.subnationalEconomicSocialRaw ?? item.economic_social_data,
      tax_exempt_companies: item.subnationalTaxExemptCompaniesRaw,
      grants_given: item.subnationalGrantsGivenRaw,
      transparency_source_name: item.subnationalTransparencySourceName,
      transparency_source_url: item.subnationalTransparencySourceUrl,
      source_name: item.subnationalTransparencySourceName,
      source_url: item.subnationalTransparencySourceUrl,
      country: isUSA ? 'US' : 'CA',
      name: item.displayName || item.name,
    },
    trimStr(item.displayName || item.name),
    isUSA,
  );
}

/** @param {Record<string, unknown>|null|undefined} item */
export function taxExemptFromExplorerItem(item) {
  if (!item) return parseSubnationalTaxExemptCompanies(null);
  if (Array.isArray(item.subnationalTaxExemptCompanies) && item.subnationalTaxExemptCompanies.length) {
    return {
      companies: item.subnationalTaxExemptCompanies,
      sourceName: trimStr(item.subnationalTransparencySourceName),
      sourceUrl: trimStr(item.subnationalTransparencySourceUrl),
    };
  }
  return parseSubnationalTaxExemptCompanies({
    tax_exempt_companies: item.subnationalTaxExemptCompaniesRaw ?? item.tax_exempt_companies,
    transparency_source_name: item.subnationalTransparencySourceName,
    transparency_source_url: item.subnationalTransparencySourceUrl,
    source_name: item.subnationalTransparencySourceName,
    source_url: item.subnationalTransparencySourceUrl,
  });
}

/** @param {Record<string, unknown>|null|undefined} item */
export function grantsGivenFromExplorerItem(item) {
  if (!item) return parseSubnationalGrantsGiven(null);
  if (Array.isArray(item.subnationalGrantsGiven) && item.subnationalGrantsGiven.length) {
    return {
      grants: item.subnationalGrantsGiven,
      sourceName: trimStr(item.subnationalTransparencySourceName),
      sourceUrl: trimStr(item.subnationalTransparencySourceUrl),
    };
  }
  return parseSubnationalGrantsGiven({
    grants_given: item.subnationalGrantsGivenRaw ?? item.grants_given,
    transparency_source_name: item.subnationalTransparencySourceName,
    transparency_source_url: item.subnationalTransparencySourceUrl,
    source_name: item.subnationalTransparencySourceName,
    source_url: item.subnationalTransparencySourceUrl,
  });
}

/** @param {Record<string, unknown>} fsRow @param {boolean} isUSA */
export function buildExplorerTransparencyFields(fsRow, isUSA) {
  if (!fsRow) return {};
  const jurisdictionName = trimStr(fsRow.name) || 'Jurisdiction';
  const economic = parseSubnationalEconomicSocialData(fsRow, jurisdictionName, isUSA);
  const tax = parseSubnationalTaxExemptCompanies(fsRow);
  const grants = parseSubnationalGrantsGiven(fsRow);
  const sourceName =
    trimStr(economic.sourceName) || trimStr(tax.sourceName) || trimStr(grants.sourceName);
  const sourceUrl =
    trimStr(economic.sourceUrl) || trimStr(tax.sourceUrl) || trimStr(grants.sourceUrl);
  const out = {};
  if (economic.hasData) out.subnationalEconomicSocial = economic;
  if (tax.companies.length) out.subnationalTaxExemptCompanies = tax.companies;
  if (grants.grants.length) out.subnationalGrantsGiven = grants.grants;
  if (sourceName) out.subnationalTransparencySourceName = sourceName;
  if (sourceUrl) out.subnationalTransparencySourceUrl = sourceUrl;
  return out;
}
