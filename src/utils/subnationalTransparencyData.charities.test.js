import fs from 'fs';
import path from 'path';
import {
  SUBNATIONAL_SERIES_PERIOD_INTRO,
  buildSubnationalModalPeriodMeta,
  buildTaxTransparencyHeadlines,
  buildTransparencyFieldsFromModalDocs,
  isCraCharitiesDataset,
  parseSubnationalTaxFromEntitiesDoc,
} from './subnationalTransparencyData';

// Pure-function tests plus static checks of src/: no Firebase, no network, no component rendering.

const record = (i, extra = {}) => ({ name: `CHARITY ${i}`, industry: 'Health', industryColor: 'bg-green-100 text-green-700', exemType: 'Charitable Organization', bn: `${100000000 + i}RR0001`, revenue_cad: 1000 - i, fiscal_period_end: '2024-03-31', ...extra });

const newDoc = (over = {}) => ({
  data_source: 'Canada Revenue Agency — Charities Directorate, "2024 List of charities". Source: open.canada.ca. Licensed under Open Government Licence — Canada.',
  source_url: 'https://open.canada.ca/data/en/dataset/80c00cdb-1358-415c-bb8b-0de7f12675b8',
  source_year: 2024,
  reporting_period: 'CRA List of charities — 2024 filing year (fiscal periods ending in 2024), published 2026-04-30',
  note: 'Charities that filed a T3010 return for fiscal periods ending in 2024, ranked by total revenue. Financial amounts are stored but not displayed in this version.',
  selection_basis: 'largest by revenue',
  total_in_source: 132,
  records_stored: 100,
  cv_data_id: 'CV-DATA-YT-002',
  records: Array.from({ length: 5 }, (_, i) => record(i)),
  ...over,
});

const headlinesFor = (doc) => {
  const fields = buildTransparencyFieldsFromModalDocs({ taxDoc: doc }, 'Yukon', false);
  const tax = parseSubnationalTaxFromEntitiesDoc(doc);
  return { fields, headlines: buildTaxTransparencyHeadlines(tax, fields.subnationalTaxHeadlineMeta), tax };
};

describe('charity registry headline wording', () => {
  test('a partial CRA list reads "Showing N of M charities (largest by revenue)"', () => {
    const { fields, headlines } = headlinesFor(newDoc());
    expect(fields.subnationalTaxHeadlineMeta.selectionBasis).toBe('largest by revenue');
    expect(headlines.hasLiveData).toBe(true);
    expect(headlines.metrics[0].label).toBe('Registry Snapshot');
    expect(headlines.metrics[0].sub).toBe('Showing 100 of 132 charities (largest by revenue)');
  });

  test('the old "Top listing from N" claim is gone', () => {
    const { headlines } = headlinesFor(newDoc());
    expect(JSON.stringify(headlines)).not.toMatch(/Top listing/);
  });

  test('a complete source listing says "Showing all N charities in the source" (and makes no "latest" claim)', () => {
    const { headlines } = headlinesFor(newDoc({ total_in_source: 100, records_stored: 100 }));
    expect(headlines.metrics[0].sub).toBe('Showing all 100 charities in the source');
    expect(JSON.stringify(headlines)).not.toMatch(/Latest/i);
    expect(headlinesFor(newDoc({ total_in_source: 35, records_stored: 35, records: [record(1)] })).headlines.metrics[0].sub).toBe('Showing all 35 charities in the source');
  });

  test('when the source total is unknown, completeness is NOT claimed', () => {
    const { headlines } = headlinesFor(newDoc({ total_in_source: undefined, records_stored: 100 }));
    expect(headlines.metrics[0].sub).toBe('Official tax-exempt registry listing');
    expect(headlines.metrics[0].sub).not.toMatch(/all/i);
  });

  test('a partial listing keeps "Showing N of M charities (largest by revenue)" exactly', () => {
    expect(headlinesFor(newDoc({ total_in_source: 132, records_stored: 100 })).headlines.metrics[0].sub).toBe('Showing 100 of 132 charities (largest by revenue)');
    expect(headlinesFor(newDoc({ total_in_source: 30570, records_stored: 100 })).headlines.metrics[0].sub).toBe('Showing 100 of 30,570 charities (largest by revenue)');
  });

  test('a document without a selection basis still gets accurate (basis-free) wording', () => {
    const { headlines } = headlinesFor(newDoc({ selection_basis: undefined }));
    expect(headlines.metrics[0].sub).toBe('Showing 100 of 132 charities');
  });

  test('non-charity tax-exempt lists say "organizations", and never claim a CRA basis', () => {
    const doc = {
      data_source: 'Some State Tax Commission exemption roll',
      source_url: 'https://example.org/roll',
      total_in_source: 50,
      records_stored: 10,
      records: Array.from({ length: 3 }, (_, i) => ({ name: `Company ${i}`, industry: 'Retail', exemType: 'Property tax', rawValue: 5000 + i })),
    };
    const { headlines } = headlinesFor(doc);
    expect(headlines.metrics[0].sub).toBe('Showing 10 of 50 organizations');
  });

  test('no dollar amount or "Largest reported value" appears for charity records without financial values', () => {
    const { headlines } = headlinesFor(newDoc());
    expect(headlines.metrics.map((m) => m.label)).toEqual(['Registry Snapshot']);
    expect(JSON.stringify(headlines)).not.toMatch(/\$/);
  });
});

describe('charity documents in the corrected shape', () => {
  test('the document is recognised as a CRA charities dataset, so the UI keeps hiding financial values', () => {
    const { fields, tax } = headlinesFor(newDoc());
    expect(isCraCharitiesDataset(fields.subnationalTaxHeadlineMeta, tax.companies)).toBe(true);
  });

  test('the source year and period are shown from the document, not as a generic "latest" label', () => {
    const meta = buildSubnationalModalPeriodMeta(newDoc(), 'tax');
    const text = JSON.stringify(meta);
    expect(text).toContain('CRA List of charities — 2024 filing year (fiscal periods ending in 2024), published 2026-04-30');
    expect(text).not.toMatch(/Latest registry extract/);
  });

  test('records without financial fields parse (the UI hides amounts for CRA lists, so there is no "$0")', () => {
    const doc = newDoc({ records: [{ name: 'NO FINANCIALS', industry: 'Other', industryColor: 'x', exemType: 'Charitable Organization', bn: '999999999RR0001' }] });
    const tax = parseSubnationalTaxFromEntitiesDoc(doc);
    expect(tax.companies).toHaveLength(1);
    expect(tax.companies[0].name).toBe('NO FINANCIALS');
    expect(isCraCharitiesDataset({ dataSource: doc.data_source }, tax.companies)).toBe(true);
  });
});

describe('reporting-period wording (no live / current / latest claims)', () => {
  test('the accordion intro for a CRA charities document names the filing-year source and says it is not a live registry', () => {
    const { intro } = buildSubnationalModalPeriodMeta(newDoc(), 'tax');
    expect(intro).toBe('This is a snapshot of the CRA List of charities for the 2024 filing year. It is not a live registry and does not show current registration status.');
    expect(intro).not.toMatch(/latest|current registry|up to date|real[- ]time/i);
  });

  test('the generic tax intro (non-CRA or unknown source) no longer claims "latest", and says it is not a live feed', () => {
    const generic = buildSubnationalModalPeriodMeta({ data_source: 'Some roll', records: [{ name: 'X', exemType: 'Property tax', rawValue: 5 }] }, 'tax').intro;
    expect(generic).toBe('This listing is a snapshot published by the source below, not a live feed. Registration or filing years may differ by organization.');
    expect(generic).not.toMatch(/latest/i);
    expect(buildSubnationalModalPeriodMeta(null, 'tax').intro).not.toMatch(/latest/i);
  });

  test('a CRA document uses its own source year in the intro (not a hard-coded 2024)', () => {
    expect(buildSubnationalModalPeriodMeta(newDoc({ source_year: 2025 }), 'tax').intro).toContain('2025 filing year');
  });

  test('the modal headline meta carries the source year so the subtitle can identify the filing year', () => {
    expect(buildTransparencyFieldsFromModalDocs({ taxDoc: newDoc() }, 'Yukon', false).subnationalTaxHeadlineMeta.sourceYear).toBe(2024);
    expect(buildTransparencyFieldsFromModalDocs({ taxDoc: newDoc({ source_year: undefined }) }, 'Yukon', false).subnationalTaxHeadlineMeta.sourceYear).toBeNull();
  });

  test('the generic series intros in the util no longer contain the unsupported tax claim', () => {
    expect(SUBNATIONAL_SERIES_PERIOD_INTRO.tax).not.toMatch(/latest/i);
  });
});

describe('src wiring', () => {
  const read = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8').replace(/\r\n/g, '\n');

  test('the snapshot heading says "Official snapshot" everywhere and never "Latest official snapshot"', () => {
    const app = read('App.js');
    expect(app.includes('Latest official snapshot')).toBe(false);
    expect((app.match(/^\s*Official snapshot$/gm) || []).length).toBe(3);
  });

  test('the util has no "Top listing from" wording and passes the selection basis through', () => {
    const util = read('utils/subnationalTransparencyData.js');
    expect(util.includes('Top listing from')).toBe(false);
    expect(util.includes("selectionBasis: trimStr(taxDoc.selection_basis) || null")).toBe(true);
    const dollar = '$'; // keeps the literal template text out of a plain string for the linter
    expect(util.includes(`Showing ${dollar}{stored.toLocaleString()} of ${dollar}{inSource.toLocaleString()} ${dollar}{noun}`)).toBe(true);
  });

  test('the charity table still hides financial values (unchanged)', () => {
    const app = read('App.js');
    expect(app.includes('Financial value not displayed in MVP')).toBe(true);
  });

  test('the footnote describes only what the table displays, and does not imply registration status is shown', () => {
    const app = read('App.js');
    expect(app.includes('For MVP, CRA charity records show organization name, category, and designation/type only. Financial values and current registration status are not displayed.')).toBe(true);
    expect(/designation\/type, and status only/.test(app)).toBe(false);
  });

  test('the subtitle names the CRA List of charities and its filing year; no "latest official snapshot" wording remains anywhere in the app or util', () => {
    const app = read('App.js');
    const util = read('utils/subnationalTransparencyData.js');
    expect(app.includes("CRA List of charities · ${taxHeadlineMeta.sourceYear} filing year")).toBe(true);
    expect(app.includes("'CRA Charities Registry'")).toBe(false);
    expect(app.includes('latest official snapshot')).toBe(false);
    expect(/latest official snapshot available from the source below/.test(util)).toBe(false);
  });
});
