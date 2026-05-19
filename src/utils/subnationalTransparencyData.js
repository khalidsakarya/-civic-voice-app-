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
  'Category-level reporting periods were not specified in source metadata';

/** Per-metric placeholder on detail-page snapshots when series is absent. */
export const TRANSPARENCY_HEADLINE_NOT_LOADED = 'Not loaded yet';

/** Modal header copy — charts/lists may use different official periods per category. */
export const SUBNATIONAL_SERIES_PERIOD_INTRO = {
  economic:
    'Each chart uses the latest official reporting period available for that category. Series may not share the same fiscal or calendar year.',
  tax:
    'This registry reflects the latest official snapshot available from the source below. Registration or filing years may differ by organization.',
  grants:
    'Awards shown use the latest official reporting period published by the source below. Totals may combine more than one fiscal year.',
};

const ECONOMIC_PERIOD_SERIES = [
  {
    label: 'Approved Budget',
    arrayKeys: ['budget_distribution', 'budgetDistribution'],
    periodKeys: ['budget_reporting_period', 'budget_distribution_reporting_period'],
    sourceKeys: ['budget_distribution_source'],
  },
  {
    label: 'Actual Spending',
    arrayKeys: ['spending_vs_budget', 'spendingVsBudget'],
    periodKeys: ['spending_reporting_period', 'spending_vs_budget_reporting_period'],
    sourceKeys: ['spending_source', 'spending_vs_budget_source'],
  },
  {
    label: 'Crime Report',
    arrayKeys: ['crime_rate', 'crime_rate_trends', 'crimeRateTrends'],
    periodKeys: ['crime_reporting_period'],
    sourceKeys: ['crime_source'],
  },
  {
    label: 'Unemployment',
    arrayKeys: [
      'unemployment_series_monthly',
      'unemployment_series_rolling_3_month',
      'unemployment_rate',
      'unemploymentRate',
    ],
    periodKeys: ['unemployment_reporting_period', 'unemployment_latest_period'],
    sourceKeys: ['unemployment_source'],
  },
  {
    label: 'GDP',
    arrayKeys: ['gdp_growth', 'gdpGrowth'],
    periodKeys: ['gdp_reporting_period'],
    sourceKeys: ['gdp_source'],
  },
  {
    label: 'Poverty',
    arrayKeys: ['poverty_rate', 'povertyRate'],
    periodKeys: ['poverty_reporting_period'],
    sourceKeys: ['poverty_source'],
  },
  {
    label: 'Homelessness PIT Count',
    arrayKeys: ['homelessness', 'homeless'],
    periodKeys: ['homelessness_reporting_period'],
    sourceKeys: ['homelessness_source'],
  },
];

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

/** @param {boolean} isUSA @param {string} countryCode */
function nationalUnemploymentKey(isUSA, countryCode) {
  const c = trimStr(countryCode).toUpperCase();
  if (c === 'AU') return 'AU Average';
  if (c.startsWith('UK')) return 'UK Average';
  return `${isUSA || c === 'US' ? 'US' : 'CA'} Average`;
}

/**
 * @param {unknown} rows
 * @param {string} jurisdictionName
 * @param {string} natKey
 */
function normalizeUnemploymentRows(rows, jurisdictionName, natKey) {
  if (!Array.isArray(rows) || !rows.length) {
    return { unempData: [], unempKeys: [], unempChartUsesPeriod: false };
  }
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
    const point = { year, periodSort: year };
    if (jVal != null) point[jurisdictionName] = jVal;
    if (nVal != null) point[natKey] = nVal;
    unempData.push(point);
  }
  const keys = [jurisdictionName];
  if (unempData.some((r) => r[natKey] != null)) keys.push(natKey);
  return {
    unempData,
    unempKeys: unempData.length ? keys : [],
    unempChartUsesPeriod: false,
  };
}

/** Modal / full-screen chart: latest N monthly or rolling periods (display only). */
const UNEMPLOYMENT_CHART_PERIOD_LIMIT = 12;

/**
 * Monthly or rolling 3-month unemployment series from Firestore.
 * @param {unknown} rows
 * @param {string} jurisdictionName
 * @param {string} natKey
 */
function normalizeUnemploymentMonthlyRows(rows, jurisdictionName, natKey) {
  if (!Array.isArray(rows) || !rows.length) {
    return { unempData: [], unempKeys: [], unempChartUsesPeriod: false };
  }
  const unempData = [];
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row || typeof row !== 'object') continue;
    const periodSort = trimStr(row.period) || trimStr(row.period_sort);
    const periodLabel =
      trimStr(row.period_label) || trimStr(row.periodLabel) || periodSort;
    if (!periodSort) continue;
    const jVal =
      numOrNull(row.jurisdiction) ??
      numOrNull(row.jurisdiction_rate) ??
      numOrNull(row[jurisdictionName]);
    const nVal =
      numOrNull(row.national_average) ??
      numOrNull(row.nationalAverage) ??
      numOrNull(row[natKey]);
    if (jVal == null && nVal == null) continue;
    const point = {
      period: periodLabel,
      periodSort,
    };
    if (jVal != null) point[jurisdictionName] = jVal;
    if (nVal != null) point[natKey] = nVal;
    unempData.push(point);
  }
  unempData.sort((a, b) => String(a.periodSort).localeCompare(String(b.periodSort)));
  const slice = unempData.slice(-UNEMPLOYMENT_CHART_PERIOD_LIMIT);
  const keys = [jurisdictionName];
  if (slice.some((r) => r[natKey] != null)) keys.push(natKey);
  return {
    unempData: slice,
    unempKeys: slice.length ? keys : [],
    unempChartUsesPeriod: true,
  };
}

/**
 * @param {Record<string, unknown>} src
 * @param {string} jurisdictionName
 * @param {boolean} isUSA
 * @param {string} countryCode
 */
function normalizeUnemploymentFromEconomic(src, jurisdictionName, isUSA, countryCode) {
  const natKey = nationalUnemploymentKey(isUSA, countryCode);
  const freq = trimStr(src.unemployment_frequency);
  let monthly;
  if (freq === 'rolling_3_month' && Array.isArray(src.unemployment_series_rolling_3_month)) {
    monthly = src.unemployment_series_rolling_3_month;
  } else if (freq === 'monthly' && Array.isArray(src.unemployment_series_monthly)) {
    monthly = src.unemployment_series_monthly;
  } else {
    monthly = src.unemployment_series_rolling_3_month ?? src.unemployment_series_monthly;
  }
  if (Array.isArray(monthly) && monthly.length) {
    const parsed = normalizeUnemploymentMonthlyRows(monthly, jurisdictionName, natKey);
    return {
      ...parsed,
      unempLatestRate: numOrNull(src.unemployment_latest_rate),
      unempLatestPeriod: trimStr(src.unemployment_latest_period),
      unempFrequency: trimStr(src.unemployment_frequency),
      unempSourceUrl:
        trimStr(src.unemployment_source_url) ||
        trimStr(src.unemployment_url),
    };
  }
  const unempRaw = src.unemployment_rate ?? src.unemploymentRate ?? src.unemployment;
  const annual = normalizeUnemploymentRows(unempRaw, jurisdictionName, natKey);
  return {
    ...annual,
    unempLatestRate: null,
    unempLatestPeriod: '',
    unempFrequency: '',
    unempSourceUrl:
      trimStr(src.unemployment_source_url) ||
      trimStr(src.unemployment_url),
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

/** @param {unknown} v */
function normalizeCrimeMetricType(v) {
  const t = trimStr(v).toLowerCase().replace(/-/g, '_');
  if (t === 'csi' || t === 'crime_severity_index') return 'csi';
  if (
    t === 'incident_count' ||
    t === 'count' ||
    t === 'incident_counts' ||
    t === 'raw_count'
  ) {
    return 'incident_count';
  }
  if (
    t === 'incident_rate' ||
    t === 'rate' ||
    t === 'rate_per_100k' ||
    t === 'rate_per_100000' ||
    t === 'per_100k'
  ) {
    return 'incident_rate';
  }
  return null;
}

/** @param {Array<Record<string, unknown>>} crimeData */
function inferCrimeMetricTypeFromValues(crimeData) {
  let maxVal = 0;
  for (let i = 0; i < crimeData.length; i += 1) {
    const row = crimeData[i];
    for (const key of Object.keys(row)) {
      if (key === 'year') continue;
      const n = numOrNull(row[key]);
      if (n != null && n > maxVal) maxVal = n;
    }
  }
  return maxVal >= 5000 ? 'incident_count' : 'incident_rate';
}

/**
 * Normalize crime series from Firestore (CSI, per-100k rates, or incident counts).
 * @param {unknown} crimeRaw
 * @param {unknown} [explicitMetricType]
 * @returns {{
 *   crimeDataM: Array<Record<string, unknown>>;
 *   crimeMetricType: 'csi' | 'incident_rate' | 'incident_count';
 *   crimeViolentKey: string;
 *   crimePropertyKey: string;
 * }}
 */
function normalizeCrimeSeries(crimeRaw, explicitMetricType) {
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

  let crimeMetricType = normalizeCrimeMetricType(explicitMetricType);
  if (isCsi) crimeMetricType = 'csi';
  else if (!crimeMetricType) crimeMetricType = inferCrimeMetricTypeFromValues(crimeData);

  return {
    crimeDataM: crimeData.slice(-6),
    crimeMetricType,
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
  const countryCode =
    trimStr(raw?.country) ||
    trimStr(raw?.subnationalCountry) ||
    (isUSA ? 'US' : 'CA');
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
      unempChartUsesPeriod: false,
      unempLatestRate: null,
      unempLatestPeriod: '',
      unempFrequency: '',
      unempSourceUrl: '',
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
  const crimeMetricFromDoc =
    src.crime_metric_type ?? src.crimeMetricType ?? src.crime_metric ?? src.crimeMetric;
  const {
    crimeDataM,
    crimeMetricType,
    crimeViolentKey,
    crimePropertyKey,
  } = normalizeCrimeSeries(crimeRaw, crimeMetricFromDoc);

  const {
    unempData,
    unempKeys,
    unempChartUsesPeriod,
    unempLatestRate,
    unempLatestPeriod,
    unempFrequency,
    unempSourceUrl,
  } = normalizeUnemploymentFromEconomic(src, jurisdictionName, isUSA, countryCode);

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
    unempChartUsesPeriod,
    unempLatestRate,
    unempLatestPeriod,
    unempFrequency,
    unempSourceUrl:
      unempSourceUrl ||
      trimStr(src.unemployment_source_url) ||
      trimStr(src.unemployment_url),
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
      crime_metric_type: doc.crime_metric_type ?? doc.crimeMetricType,
      unemployment_rate: doc.unemployment_rate,
      unemployment_latest_rate: doc.unemployment_latest_rate,
      unemployment_latest_period: doc.unemployment_latest_period,
      unemployment_frequency: doc.unemployment_frequency,
      unemployment_series_monthly: doc.unemployment_series_monthly,
      unemployment_series_rolling_3_month: doc.unemployment_series_rolling_3_month,
      unemployment_source_url: doc.unemployment_source_url,
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

/** @param {Record<string, unknown>} doc @param {string[]} keys */
function pickFirstTrimmed(doc, keys) {
  for (let i = 0; i < keys.length; i += 1) {
    const v = trimStr(doc[keys[i]]);
    if (v) return v;
  }
  return '';
}

/** @param {Record<string, unknown>} doc @param {string[]} arrayKeys */
function firstNonEmptyArray(doc, arrayKeys) {
  for (let i = 0; i < arrayKeys.length; i += 1) {
    const arr = doc[arrayKeys[i]];
    if (Array.isArray(arr) && arr.length) return arr;
  }
  return null;
}

/** @param {unknown} series */
function yearRangeFromSeries(series) {
  if (!Array.isArray(series) || !series.length) return '';
  const years = [];
  for (let i = 0; i < series.length; i += 1) {
    const y = trimStr(series[i]?.year);
    if (y) years.push(y);
  }
  if (!years.length) return '';
  years.sort();
  if (years.length === 1) return years[0];
  return `${years[0]}–${years[years.length - 1]}`;
}

/** @param {unknown} records */
function yearRangeFromRecordYears(records) {
  if (!Array.isArray(records) || !records.length) return '';
  const years = new Set();
  for (let i = 0; i < records.length; i += 1) {
    const y = records[i]?.year;
    if (y != null && String(y).trim() && String(y).trim() !== '—') {
      years.add(String(y).trim());
    }
  }
  if (!years.size) return '';
  const sorted = [...years].sort();
  if (sorted.length === 1) return sorted[0];
  return `${sorted[0]}–${sorted[sorted.length - 1]}`;
}

/**
 * @param {Record<string, unknown>} doc
 * @param {{
 *   label: string;
 *   arrayKeys: string[];
 *   periodKeys: string[];
 *   sourceKeys?: string[];
 * }} spec
 */
function buildEconomicPeriodCategory(doc, spec) {
  const data = firstNonEmptyArray(doc, spec.arrayKeys);
  const periodMeta = pickFirstTrimmed(doc, spec.periodKeys);
  if (!data && !periodMeta) return null;

  let period = periodMeta;
  if (!period && data) {
    const range = yearRangeFromSeries(data);
    if (range) period = `Latest series years: ${range}`;
  }
  if (!period) {
    const source = spec.sourceKeys ? pickFirstTrimmed(doc, spec.sourceKeys) : '';
    if (source) period = source;
  }
  if (!period) return null;

  return { label: spec.label, period };
}

/** @param {Record<string, unknown>} doc */
function buildEconomicPeriodCategories(doc) {
  const categories = [];
  for (let i = 0; i < ECONOMIC_PERIOD_SERIES.length; i += 1) {
    const cat = buildEconomicPeriodCategory(doc, ECONOMIC_PERIOD_SERIES[i]);
    if (cat) categories.push(cat);
  }
  return categories;
}

/** @param {Record<string, unknown>} doc */
function buildTaxPeriodCategories(doc) {
  const records = Array.isArray(doc.records) ? doc.records : [];
  const explicit = pickExplicitPeriodFromDoc(doc);
  const note = trimStr(doc.note);
  const dataSource = trimStr(doc.data_source) || trimStr(doc.source);

  let period = explicit ? formatExplicitPeriodLabel(explicit) : '';
  if (!period) {
    const range = yearRangeFromRecordYears(records);
    if (range) period = `Registration years in list: ${range}`;
  }
  if (!period && dataSource) period = 'Latest registry extract';
  if (!period && !records.length) return [];

  if (note && period && !period.includes(note)) {
    period = `${period} (${note})`;
  }

  return [{ label: 'Registry Snapshot', period: period || 'Latest registry extract' }];
}

/** @param {Record<string, unknown>} doc */
function buildGrantsPeriodCategories(doc) {
  const explicit = pickExplicitPeriodFromDoc(doc);
  const note = trimStr(doc.note);
  const dataSource = trimStr(doc.data_source) || trimStr(doc.source);
  const records = Array.isArray(doc.records) ? doc.records : [];

  let period = explicit ? formatExplicitPeriodLabel(explicit) : '';
  if (!period && dataSource) period = dataSource;
  if (!period) {
    const range = yearRangeFromRecordYears(
      records.map((r) => ({ year: r?.date ?? r?.fiscal_year ?? r?.year })),
    );
    if (range) period = `Award dates in list: ${range}`;
  }
  if (!period && records.length) period = 'Latest published grant awards';

  if (note && period && !period.toLowerCase().includes(note.toLowerCase())) {
    period = `${period} — ${note}`;
  }

  if (!period && !records.length) return [];
  return [{ label: 'Public Accounts / Grants', period: period || 'Latest published grant awards' }];
}

/**
 * Category-level reporting metadata for subnational modal headers.
 * @param {Record<string, unknown>|null|undefined} doc
 * @param {'economic'|'tax'|'grants'} kind
 * @returns {{ intro: string; categories: Array<{ label: string; period: string }>; footnote: string }}
 */
export function buildSubnationalModalPeriodMeta(doc, kind) {
  const intro = SUBNATIONAL_SERIES_PERIOD_INTRO[kind] || SUBNATIONAL_SERIES_PERIOD_INTRO.economic;
  if (!doc || typeof doc !== 'object') {
    return { intro, categories: [], footnote: '' };
  }

  let categories = [];
  if (kind === 'economic') categories = buildEconomicPeriodCategories(doc);
  else if (kind === 'tax') categories = buildTaxPeriodCategories(doc);
  else if (kind === 'grants') categories = buildGrantsPeriodCategories(doc);

  if (!categories.length) {
    const explicit = pickExplicitPeriodFromDoc(doc);
    if (explicit) {
      const label =
        kind === 'tax'
          ? 'Registry Snapshot'
          : kind === 'grants'
            ? 'Public Accounts / Grants'
            : 'Official series';
      categories = [{ label, period: formatExplicitPeriodLabel(explicit) }];
    } else if (kind === 'economic') {
      const composite = trimStr(doc.reporting_period);
      if (composite) {
        categories = [{ label: 'Official series', period: composite }];
      }
    } else if (kind === 'tax') {
      const dataSource = trimStr(doc.data_source) || trimStr(doc.source);
      if (dataSource) categories = [{ label: 'Registry Snapshot', period: dataSource }];
    } else if (kind === 'grants') {
      const dataSource = trimStr(doc.data_source) || trimStr(doc.source);
      if (dataSource) categories = [{ label: 'Public Accounts / Grants', period: dataSource }];
    }
  }

  const compositeNote = trimStr(doc.reporting_period);
  let footnote = '';
  if (
    compositeNote &&
    kind === 'economic' &&
    categories.length > 1 &&
    !categories.some((c) => c.period === compositeNote)
  ) {
    footnote = compositeNote;
  }

  return { intro, categories, footnote };
}

/**
 * Human-readable reporting period from a dedicated modal Firestore document.
 * @param {Record<string, unknown>|null|undefined} doc
 * @param {'economic'|'tax'|'grants'} kind
 * @returns {string}
 */
export function reportingPeriodLineFromModalDoc(doc, kind) {
  const { intro, categories, footnote } = buildSubnationalModalPeriodMeta(doc, kind);
  if (!categories.length) {
    return REPORTING_PERIOD_NOT_SPECIFIED;
  }
  const lines = categories.map((c) => `${c.label}: ${c.period}`);
  const block = [intro, ...lines, footnote].filter(Boolean).join(' · ');
  return block;
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
    const economicPeriod = buildSubnationalModalPeriodMeta(docs?.economicDoc || null, 'economic');
    out.subnationalEconomicSocial = economic;
    out.subnationalEconomicPeriodIntro = economicPeriod.intro;
    out.subnationalEconomicPeriodCategories = economicPeriod.categories;
    out.subnationalEconomicPeriodFootnote = economicPeriod.footnote;
    out.subnationalEconomicReportingPeriod = reportingPeriodLineFromModalDoc(
      docs?.economicDoc || null,
      'economic',
    );
  }
  if (tax.companies.length) {
    const taxDoc = docs?.taxDoc || null;
    const taxPeriod = buildSubnationalModalPeriodMeta(taxDoc, 'tax');
    out.subnationalTaxExemptCompanies = tax.companies;
    out.subnationalTaxPeriodIntro = taxPeriod.intro;
    out.subnationalTaxPeriodCategories = taxPeriod.categories;
    out.subnationalTaxPeriodFootnote = taxPeriod.footnote;
    out.subnationalTaxReportingPeriod = reportingPeriodLineFromModalDoc(taxDoc, 'tax');
    if (taxDoc && typeof taxDoc === 'object') {
      out.subnationalTaxHeadlineMeta = {
        recordsStored: numOrNull(taxDoc.records_stored),
        totalInSource: numOrNull(taxDoc.total_in_source),
      };
    }
  }
  if (grants.grants.length) {
    const grantsDoc = docs?.grantsDoc || null;
    const grantsPeriod = buildSubnationalModalPeriodMeta(grantsDoc, 'grants');
    out.subnationalGrantsGiven = grants.grants;
    out.subnationalGrantsPeriodIntro = grantsPeriod.intro;
    out.subnationalGrantsPeriodCategories = grantsPeriod.categories;
    out.subnationalGrantsPeriodFootnote = grantsPeriod.footnote;
    out.subnationalGrantsReportingPeriod = reportingPeriodLineFromModalDoc(grantsDoc, 'grants');
    if (grantsDoc && typeof grantsDoc === 'object') {
      out.subnationalGrantsHeadlineMeta = {
        recordsStored: numOrNull(grantsDoc.records_stored),
        totalInSource: numOrNull(grantsDoc.total_in_source),
        fmtTotalTop: trimStr(grantsDoc.fmt_total_top100),
        fiscalYear: trimStr(grantsDoc.fiscal_year),
      };
    }
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

/** @param {Array<{ year?: string }>} rows */
function latestRowByYear(rows) {
  if (!Array.isArray(rows) || !rows.length) return null;
  return [...rows].sort((a, b) => String(a.year || '').localeCompare(String(b.year || ''))).pop() || null;
}

/**
 * @param {number|null|undefined} violent
 * @param {number|null|undefined} property
 * @param {'csi'|'incident_rate'|'incident_count'} metricType
 */
function formatCrimeHeadlinePair(violent, property, metricType) {
  if (violent == null && property == null) return '';
  const v = violent != null ? Number(violent) : null;
  const p = property != null ? Number(property) : null;
  if (metricType === 'csi') {
    const parts = [];
    if (v != null && Number.isFinite(v)) parts.push(`Violent ${v.toFixed(1)}`);
    if (p != null && Number.isFinite(p)) parts.push(`Non-violent ${p.toFixed(1)}`);
    return parts.length ? `${parts.join(' · ')} (CSI, 2006=100)` : '';
  }
  if (metricType === 'incident_count') {
    const parts = [];
    if (v != null && Number.isFinite(v)) parts.push(`${v.toLocaleString()} violent`);
    if (p != null && Number.isFinite(p)) parts.push(`${p.toLocaleString()} property`);
    return parts.join(' · ');
  }
  const parts = [];
  if (v != null && Number.isFinite(v)) parts.push(`${v.toFixed(1)} violent`);
  if (p != null && Number.isFinite(p)) parts.push(`${p.toFixed(1)} property`);
  return parts.length ? `${parts.join(' · ')} per 100K` : '';
}

/** Snapshot row → chart panel id for the economic modal. */
export const ECONOMIC_METRIC_CHART_SECTION_TITLE = Object.freeze({
  budget: 'Approved Budget — trend chart',
  spending: 'Actual Spending — trend chart',
  crime: 'Crime Report — trend chart',
  unemployment: 'Unemployment — trend chart',
  gdp: 'GDP — trend chart',
  poverty: 'Poverty — trend chart',
  homeless: 'Homelessness PIT Count — trend chart',
});

/**
 * @param {ReturnType<typeof parseSubnationalEconomicSocialData>} economic
 * @param {string} chartKey
 */
export function economicMetricChartAvailable(economic, chartKey) {
  if (!economic?.hasData || !chartKey) return false;
  switch (chartKey) {
    case 'budget':
      return economic.budgetData.length > 0;
    case 'spending':
      return economic.spendData.length > 0;
    case 'crime':
      return economic.crimeDataM.length > 0;
    case 'unemployment':
      return (
        economic.unempData.length > 0 &&
        economic.unempKeys.length >= 1 &&
        economic.unempKeys.some((k) =>
          economic.unempData.some((row) => numOrNull(row[k]) != null),
        )
      );
    case 'gdp':
      return economic.gdpDataM.length > 0;
    case 'poverty':
      return economic.povDataM.length > 0;
    case 'homeless':
      return economic.homelessData.length > 0;
    default:
      return false;
  }
}

/**
 * Latest official snapshot lines for the province/state detail page (economic module).
 * @param {ReturnType<typeof parseSubnationalEconomicSocialData>} economic
 * @param {string} jurisdictionLabel
 */
export function buildEconomicTransparencyHeadlines(economic, jurisdictionLabel) {
  if (!economic?.hasData) {
    return { hasLiveData: false, metrics: [] };
  }

  /** @type {Array<{ label: string; value: string; sub?: string; chartKey?: string; chartAvailable?: boolean }>} */
  const metrics = [];

  if (economic.budgetData.length) {
    const top = [...economic.budgetData].sort((a, b) => b.value - a.value)[0];
    metrics.push({
      label: 'Approved Budget',
      value: `${top.value}%`,
      sub: `Largest share: ${top.name}`,
      chartKey: 'budget',
      chartAvailable: economicMetricChartAvailable(economic, 'budget'),
    });
  }

  if (economic.spendData.length) {
    let alloc = 0;
    let actual = 0;
    for (let i = 0; i < economic.spendData.length; i += 1) {
      alloc += Number(economic.spendData[i].Allocated) || 0;
      actual += Number(economic.spendData[i].Actual) || 0;
    }
    const pct = alloc > 0 ? Math.round((actual / alloc) * 100) : null;
    metrics.push({
      label: 'Actual Spending',
      value: formatCurrencyCompact(actual),
      sub:
        pct != null
          ? `${pct}% of ${formatCurrencyCompact(alloc)} allocated (official categories)`
          : `Allocated ${formatCurrencyCompact(alloc)}`,
      chartKey: 'spending',
      chartAvailable: economicMetricChartAvailable(economic, 'spending'),
    });
  }

  if (economic.crimeDataM.length) {
    const latest = latestRowByYear(economic.crimeDataM);
    if (latest) {
      const violent = latest[economic.crimeViolentKey];
      const property = latest[economic.crimePropertyKey];
      const value = formatCrimeHeadlinePair(violent, property, economic.crimeMetricType);
      if (value) {
        metrics.push({
          label: 'Crime Report',
          value,
          sub: `Latest year: ${latest.year}`,
          chartKey: 'crime',
          chartAvailable: economicMetricChartAvailable(economic, 'crime'),
        });
      }
    }
  }

  if (economic.unempLatestRate != null) {
    const freq = economic.unempFrequency;
    const freqLabel =
      freq === 'rolling_3_month'
        ? 'rolling 3-month'
        : freq === 'monthly'
          ? 'monthly'
          : 'official';
    metrics.push({
      label: 'Unemployment',
      value: `${economic.unempLatestRate}%`,
      sub: economic.unempLatestPeriod
        ? `Latest ${freqLabel}: ${economic.unempLatestPeriod}`
        : `Latest ${freqLabel} rate`,
      chartKey: 'unemployment',
      chartAvailable: economicMetricChartAvailable(economic, 'unemployment'),
    });
  } else if (economic.unempData.length && economic.unempKeys.length) {
    const latest = latestRowByYear(economic.unempData);
    const jKey = economic.unempKeys[0];
    if (latest && jKey) {
      const rate = numOrNull(latest[jKey]);
      if (rate != null) {
        metrics.push({
          label: 'Unemployment',
          value: `${rate}%`,
          sub: `Latest year: ${latest.year}`,
          chartKey: 'unemployment',
          chartAvailable: economicMetricChartAvailable(economic, 'unemployment'),
        });
      }
    }
  }

  if (economic.gdpDataM.length) {
    const latest = latestRowByYear(economic.gdpDataM);
    const growth = latest ? numOrNull(latest['GDP Growth (%)']) : null;
    if (latest && growth != null) {
      metrics.push({
        label: 'GDP',
        value: `${growth >= 0 ? '+' : ''}${growth}%`,
        sub: `Annual growth · ${latest.year}`,
        chartKey: 'gdp',
        chartAvailable: economicMetricChartAvailable(economic, 'gdp'),
      });
    }
  }

  if (economic.povDataM.length) {
    const latest = latestRowByYear(economic.povDataM);
    const rate = latest ? numOrNull(latest['Poverty Rate (%)']) : null;
    if (latest && rate != null) {
      metrics.push({
        label: 'Poverty',
        value: `${rate}%`,
        sub: `Latest year: ${latest.year}`,
        chartKey: 'poverty',
        chartAvailable: economicMetricChartAvailable(economic, 'poverty'),
      });
    }
  }

  if (economic.homelessData.length) {
    const latest = latestRowByYear(economic.homelessData);
    if (latest) {
      const total =
        (numOrNull(latest.Sheltered) ?? 0) + (numOrNull(latest.Unsheltered) ?? 0);
      metrics.push({
        label: 'Homelessness PIT Count',
        value: total.toLocaleString(),
        sub: `PIT ${latest.year} · ${(numOrNull(latest.Sheltered) ?? 0).toLocaleString()} sheltered`,
        chartKey: 'homeless',
        chartAvailable: economicMetricChartAvailable(economic, 'homeless'),
      });
    }
  }

  return { hasLiveData: metrics.length > 0, metrics };
}

/**
 * @param {{ companies: Array<Record<string, unknown>>; sourceName?: string }} tax
 * @param {{ recordsStored?: number|null; totalInSource?: number|null }|null|undefined} meta
 */
export function buildTaxTransparencyHeadlines(tax, meta) {
  const companies = tax?.companies;
  if (!Array.isArray(companies) || !companies.length) {
    return { hasLiveData: false, metrics: [] };
  }

  /** @type {Array<{ label: string; value: string; sub?: string }>} */
  const metrics = [];
  const stored = meta?.recordsStored ?? companies.length;
  const inSource = meta?.totalInSource;

  metrics.push({
    label: 'Registry Snapshot',
    value: `${stored.toLocaleString()} organizations`,
    sub:
      inSource != null && inSource > stored
        ? `Top listing from ${inSource.toLocaleString()} in official source`
        : 'Latest official tax-exempt registry listing',
  });

  let topValue = 0;
  let topName = '';
  for (let i = 0; i < companies.length; i += 1) {
    const raw = numOrNull(companies[i].rawValue) ?? 0;
    if (raw > topValue) {
      topValue = raw;
      topName = trimStr(companies[i].name);
    }
  }
  if (topValue > 0) {
    metrics.push({
      label: 'Largest reported value',
      value: formatCurrencyCompact(topValue),
      sub: topName || undefined,
    });
  }

  return { hasLiveData: true, metrics };
}

/**
 * @param {{ grants: Array<Record<string, unknown>>; sourceName?: string }} grants
 * @param {{ recordsStored?: number|null; totalInSource?: number|null; fmtTotalTop?: string; fiscalYear?: string }|null|undefined} meta
 */
export function buildGrantsTransparencyHeadlines(grants, meta) {
  const rows = grants?.grants;
  if (!Array.isArray(rows) || !rows.length) {
    return { hasLiveData: false, metrics: [] };
  }

  /** @type {Array<{ label: string; value: string; sub?: string }>} */
  const metrics = [];
  const stored = meta?.recordsStored ?? rows.length;
  const fy = meta?.fiscalYear;

  let topAmt = 0;
  let topRecipient = '';
  let sumAmt = 0;
  for (let i = 0; i < rows.length; i += 1) {
    const raw = numOrNull(rows[i].rawAmount) ?? 0;
    sumAmt += raw;
    if (raw > topAmt) {
      topAmt = raw;
      topRecipient = trimStr(rows[i].recipientName);
    }
  }

  metrics.push({
    label: 'Public Accounts / Grants',
    value: meta?.fmtTotalTop || formatCurrencyCompact(sumAmt),
    sub: fy
      ? `FY ${fy} · top ${stored.toLocaleString()} awards by amount`
      : `Top ${stored.toLocaleString()} awards by amount`,
  });

  if (topAmt > 0) {
    metrics.push({
      label: 'Largest award',
      value: formatCurrencyCompact(topAmt),
      sub: topRecipient.length > 48 ? `${topRecipient.slice(0, 45)}…` : topRecipient,
    });
  }

  return { hasLiveData: true, metrics };
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
