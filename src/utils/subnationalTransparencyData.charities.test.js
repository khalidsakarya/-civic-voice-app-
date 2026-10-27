import fs from 'fs';
import path from 'path';
import {
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

  test('when every charity is shown there is no "latest" claim either', () => {
    const { headlines } = headlinesFor(newDoc({ total_in_source: 100, records_stored: 100 }));
    expect(headlines.metrics[0].sub).toBe('Official tax-exempt registry listing');
    expect(JSON.stringify(headlines)).not.toMatch(/Latest/i);
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

describe('src wiring', () => {
  const read = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8').replace(/\r\n/g, '\n');

  test('the snapshot heading says "Official snapshot" everywhere and never "Latest official snapshot"', () => {
    const app = read('App.js');
    expect(app).not.toContain('Latest official snapshot');
    expect((app.match(/^\s*Official snapshot$/gm) || []).length).toBe(3);
  });

  test('the util has no "Top listing from" wording and passes the selection basis through', () => {
    const util = read('utils/subnationalTransparencyData.js');
    expect(util).not.toContain('Top listing from');
    expect(util).toContain("selectionBasis: trimStr(taxDoc.selection_basis) || null");
    const dollar = '$'; // keeps the literal template text out of a plain string for the linter
    expect(util).toContain(`Showing ${dollar}{stored.toLocaleString()} of ${dollar}{inSource.toLocaleString()} ${dollar}{noun}`);
  });

  test('the charity table still hides financial values (unchanged)', () => {
    const app = read('App.js');
    expect(app).toContain('Financial value not displayed in MVP');
  });
});
