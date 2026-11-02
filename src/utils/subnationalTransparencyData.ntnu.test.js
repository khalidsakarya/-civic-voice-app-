import {
  buildSubnationalModalPeriodMeta,
  buildTaxTransparencyHeadlines,
  buildTransparencyFieldsFromModalDocs,
  isCraCharitiesDataset,
  parseSubnationalTaxFromEntitiesDoc,
  subnationalTransparencyJurisdictionId,
} from './subnationalTransparencyData';
import prepared from './__fixtures__/charities-nt-nu-2024-prepared.json';

// CA-NT and CA-NU have no charities document today. The fixture holds the EXACT documents the guarded creation
// would store (built from the official CRA 2024 list), so these tests show how the existing modal logic treats a
// jurisdiction that previously had none. Pure functions only: no Firebase, no network, no component rendering.

const run = (id, regionName) => {
  const doc = prepared[id];
  const fields = buildTransparencyFieldsFromModalDocs({ taxDoc: doc }, regionName, false);
  const tax = parseSubnationalTaxFromEntitiesDoc(doc);
  const headlines = buildTaxTransparencyHeadlines(tax, fields.subnationalTaxHeadlineMeta);
  return { doc, fields, tax, headlines };
};

describe.each([
  ['CA-NT', 'Northwest Territories', 100, 101, 'ca-nt'],
  ['CA-NU', 'Nunavut', 35, 35, 'ca-nu'],
])('%s charities document (not yet created)', (id, region, stored, inSource, flagCode) => {
  const { doc, fields, tax, headlines } = run(id, region);

  test('the explorer row resolves to the right document id', () => {
    expect(subnationalTransparencyJurisdictionId({ flagCode }, false)).toBe(id);
  });

  test('every selected record reaches the table, in ranked order, none dropped or deduplicated', () => {
    expect(doc.records).toHaveLength(stored);
    expect(tax.companies).toHaveLength(stored);
    expect(tax.companies.map((c) => c.name)).toEqual(doc.records.map((r) => r.name));
  });

  test('the official CRA 2024 source is named, with the 2024 reporting period (not a generic "latest" label)', () => {
    expect(tax.sourceName).toContain('"2024 List of charities"');
    expect(tax.sourceName).toContain('Open Government Licence');
    expect(tax.sourceUrl).toBe('https://open.canada.ca/data/en/dataset/80c00cdb-1358-415c-bb8b-0de7f12675b8');
    expect(fields.subnationalTaxHeadlineMeta.dataSource).toContain('"2024 List of charities"');
    const period = JSON.stringify(buildSubnationalModalPeriodMeta(doc, 'tax'));
    expect(period).toContain('CRA List of charities — 2024 filing year (fiscal periods ending in 2024), published 2026-04-30');
    expect(period).not.toMatch(/Latest registry extract/);
  });

  test('it is recognised as a CRA charities dataset, so the table keeps hiding financial values', () => {
    expect(isCraCharitiesDataset(fields.subnationalTaxHeadlineMeta, tax.companies)).toBe(true);
  });

  test('count wording: "Showing N of M charities (largest by revenue)" only when the list is partial, never "Top listing from N"', () => {
    const snapshot = headlines.metrics[0];
    expect(snapshot.label).toBe('Registry Snapshot');
    expect(snapshot.value).toBe(`${stored} organizations`);
    expect(snapshot.sub).toBe(inSource > stored ? `Showing ${stored} of ${inSource} charities (largest by revenue)` : 'Official tax-exempt registry listing');
    expect(JSON.stringify(headlines)).not.toMatch(/Top listing|Latest/);
  });

  test('no placeholder financial value: no rawValue field, no dollar text anywhere in the headline view', () => {
    expect(JSON.stringify(doc)).not.toContain('rawValue');
    expect(headlines.metrics.map((m) => m.label)).toEqual(['Registry Snapshot']);
    expect(JSON.stringify(headlines)).not.toMatch(/\$/);
    tax.companies.forEach((c) => expect(c.rawValue).toBe(0)); // the CRA table shows "Financial value not displayed in MVP" instead of a number
  });

  test('revenue ranking is preserved from the document (highest first)', () => {
    const rev = doc.records.filter((r) => typeof r.revenue_cad === 'number').map((r) => r.revenue_cad);
    rev.forEach((v, i) => { if (i) expect(rev[i - 1]).toBeGreaterThanOrEqual(v); });
  });
});

describe('edge cases present in the real NT / NU data', () => {
  test('NT: the selected charity with no reported revenue is kept, last, with no invented value', () => {
    const last = prepared['CA-NT'].records[99];
    expect(last.name).toBe('Canada-Ghana Education Project');
    expect('revenue_cad' in last).toBe(false);
    expect(parseSubnationalTaxFromEntitiesDoc(prepared['CA-NT']).companies[99].name).toBe(last.name);
  });

  test('NT: identical names (distinct BNs) are all shown; the table keys rows by index, so none is collapsed', () => {
    const names = prepared['CA-NT'].records.map((r) => r.name.toUpperCase());
    expect(names.filter((n) => n === 'THE BISHOP OF THE ARCTIC')).toHaveLength(11);
    const bns = prepared['CA-NT'].records.map((r) => r.bn);
    expect(new Set(bns).size).toBe(100);
    const app = require('fs').readFileSync(require('path').join(__dirname, '..', 'App.js'), 'utf8');
    expect(app).toMatch(/\{filtered\.map\(\(co, i\) => \(\s*<div key=\{i\}/);
  });

  test('NU: all 35 charities are shown and every one reports revenue', () => {
    const records = prepared['CA-NU'].records;
    expect(records).toHaveLength(35);
    expect(records.every((r) => typeof r.revenue_cad === 'number')).toBe(true);
    expect(prepared['CA-NU'].total_in_source).toBe(35);
  });
});

describe('a jurisdiction with NO charities document (today for NT / NU)', () => {
  test('parses to an empty list without throwing, and the modal logic reports no live data', () => {
    const tax = parseSubnationalTaxFromEntitiesDoc(null);
    expect(tax.companies).toEqual([]);
    const fields = buildTransparencyFieldsFromModalDocs({ taxDoc: null }, 'Nunavut', false);
    expect(buildTaxTransparencyHeadlines(tax, fields.subnationalTaxHeadlineMeta)).toEqual({ hasLiveData: false, metrics: [] });
  });
});
