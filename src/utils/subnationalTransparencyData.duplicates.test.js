import fs from 'fs';
import path from 'path';
import {
  annotateDuplicateNames,
  buildTransparencyFieldsFromModalDocs,
  displayNameKey,
  filterTaxExemptCompanies,
  parseSubnationalTaxFromEntitiesDoc,
} from './subnationalTransparencyData';
import prepared from './__fixtures__/charities-nt-nu-2024-prepared.json';

// Display-only BN enhancement. Pure functions, no Firebase, no network, no component rendering.

const rec = (name, bn, extra = {}) => ({ name, industry: 'Religion', industryColor: 'bg-purple-100 text-purple-700', exemType: 'Charitable Organization', ...(bn === undefined ? {} : { bn }), revenue_cad: 1000, ...extra });
const doc = (records) => ({
  data_source: 'Canada Revenue Agency — Charities Directorate, "2024 List of charities". Source: open.canada.ca.',
  source_url: 'https://open.canada.ca/data/en/dataset/80c00cdb-1358-415c-bb8b-0de7f12675b8',
  source_year: 2024,
  cv_data_id: 'CV-DATA-NT-002',
  records,
});
const parse = (records) => parseSubnationalTaxFromEntitiesDoc(doc(records)).companies;

describe('duplicate Legal Names show the BN as secondary text', () => {
  test('rows whose displayed name is repeated within the list get a "BN …" label; unique names get none', () => {
    const rows = parse([
      rec('THE BISHOP OF THE ARCTIC', '108092008RR0001'),
      rec('A UNIQUE SOCIETY', '123456789RR0001'),
      rec('THE BISHOP OF THE ARCTIC', '108092008RR0007'),
      rec('ANOTHER UNIQUE CHARITY', '987654321RR0001'),
    ]);
    expect(rows.map((r) => r.bnLabel)).toEqual(['BN 108092008RR0001', undefined, 'BN 108092008RR0007', undefined]);
  });

  test('the original Legal Name is never changed, and order, ranking and revenue data are untouched', () => {
    const records = [rec('SAME NAME', '111111111RR0001', { revenue_cad: 900 }), rec('Other', '222222222RR0001', { revenue_cad: 800 }), rec('SAME NAME', '333333333RR0002', { revenue_cad: 700 })];
    const rows = parse(records);
    expect(rows.map((r) => r.name)).toEqual(['SAME NAME', 'Other', 'SAME NAME']);
    const plain = parseSubnationalTaxFromEntitiesDoc({ ...doc(records), records: records.map(({ bn, ...r }) => r) }).companies;
    expect(rows.map((r) => r.name)).toEqual(plain.map((r) => r.name));
    expect(rows.map((r) => r.rawValue)).toEqual(plain.map((r) => r.rawValue));
    expect(rows.map((r) => r.fmtValue)).toEqual(plain.map((r) => r.fmtValue));
    expect(rows.map((r) => r.industry)).toEqual(plain.map((r) => r.industry));
  });

  test('repeated names are detected ignoring case and repeated spaces, never by looser matching', () => {
    const rows = parse([rec('St. Paul  Anglican Church', '111111111RR0001'), rec('ST. PAUL ANGLICAN CHURCH', '111111111RR0002'), rec('St Paul Anglican Church', '111111111RR0003')]);
    expect(rows.map((r) => r.bnLabel)).toEqual(['BN 111111111RR0001', 'BN 111111111RR0002', undefined]);
    expect(displayNameKey('  A   B ')).toBe('a b');
  });

  test('a duplicated name with a missing or malformed BN is handled safely: no label, no crash, no placeholder text', () => {
    const rows = parse([rec('DUP', undefined), rec('DUP', ''), rec('DUP', 'not-a-bn'), rec('DUP', '12345'), rec('DUP', '111111111RR0001'), rec('DUP', null)]);
    expect(rows).toHaveLength(6);
    expect(rows.map((r) => r.bn)).toEqual(['', '', '', '', '111111111RR0001', '']);
    expect(rows.map((r) => r.bnLabel)).toEqual([undefined, undefined, undefined, undefined, 'BN 111111111RR0001', undefined]);
    expect(JSON.stringify(rows)).not.toMatch(/undefined|null|NaN/);
  });

  test('only the BN is exposed: no array index, document id or other internal identifier ever appears in a label', () => {
    const rows = parse([rec('DUP', '111111111RR0001'), rec('DUP', '111111111RR0002')]);
    rows.forEach((r) => expect(r.bnLabel).toMatch(/^BN \d{9}RR\d{4}$/));
    expect(Object.keys(rows[0]).sort()).toEqual(['bn', 'bnLabel', 'exemType', 'fmtValue', 'industry', 'industryColor', 'name', 'rawValue', 'year']);
  });

  test('a list with no repeated names gets no labels at all', () => {
    expect(parse([rec('A', '111111111RR0001'), rec('B', '222222222RR0001'), rec('C', '333333333RR0001')]).every((r) => r.bnLabel === undefined)).toBe(true);
    expect(annotateDuplicateNames([])).toEqual([]);
  });

  test('legacy (non-CRA) documents without any bn field are unaffected', () => {
    const rows = parseSubnationalTaxFromEntitiesDoc({ data_source: 'Some roll', records: [{ name: 'X', industry: 'Retail', exemType: 'Property tax', rawValue: 5 }, { name: 'X', industry: 'Retail', exemType: 'Property tax', rawValue: 6 }] }).companies;
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.bn === '' && r.bnLabel === undefined)).toBe(true);
  });
});

describe('real Northwest Territories data (the list with the most repeated names)', () => {
  const nt = prepared['CA-NT'];
  const rows = parseSubnationalTaxFromEntitiesDoc(nt).companies;

  test('all 11 "THE BISHOP OF THE ARCTIC" rows and the 4 Mackenzie Catholic rows get a distinct BN label; every unique name gets none', () => {
    const labelled = rows.filter((r) => r.bnLabel);
    const keyCount = new Map();
    rows.forEach((r) => keyCount.set(displayNameKey(r.name), (keyCount.get(displayNameKey(r.name)) || 0) + 1));
    expect(labelled.length).toBe([...keyCount.values()].filter((n) => n > 1).reduce((a, b) => a + b, 0));
    expect(labelled.filter((r) => /^THE BISHOP OF THE ARCTIC$/i.test(r.name))).toHaveLength(11);
    expect(new Set(labelled.filter((r) => /^THE BISHOP OF THE ARCTIC$/i.test(r.name)).map((r) => r.bnLabel)).size).toBe(11);
    rows.filter((r) => !r.bnLabel).forEach((r) => expect(keyCount.get(displayNameKey(r.name))).toBe(1));
  });

  test('names, order, ranking and revenue are exactly the stored ones', () => {
    expect(rows).toHaveLength(100);
    expect(rows.map((r) => r.name)).toEqual(nt.records.map((r) => r.name));
    expect(rows[0].name).toBe('AURORA COLLEGE');
    expect(rows[99].name).toBe('Canada-Ghana Education Project');
    rows.forEach((r) => expect(r.rawValue).toBe(0));
  });

  test('Nunavut (no repeated names) shows no BN labels', () => {
    expect(parseSubnationalTaxFromEntitiesDoc(prepared['CA-NU']).companies.some((r) => r.bnLabel)).toBe(false);
  });

  test('the modal fields carry the annotated rows and the filing year', () => {
    const fields = buildTransparencyFieldsFromModalDocs({ taxDoc: nt }, 'Northwest Territories', false);
    expect(fields.subnationalTaxExemptCompanies.filter((r) => r.bnLabel).length).toBeGreaterThan(0);
    expect(fields.subnationalTaxHeadlineMeta.sourceYear).toBe(2024);
  });
});

describe('BN is searchable through the existing table search', () => {
  const rows = parse([rec('THE BISHOP OF THE ARCTIC', '108092008RR0001'), rec('THE BISHOP OF THE ARCTIC', '108092008RR0007'), rec('A UNIQUE SOCIETY', '123456789RR0001', { industry: 'Health' })]);

  test('by full BN, partial BN and BN typed with spaces or hyphens; case-insensitive', () => {
    expect(filterTaxExemptCompanies(rows, '108092008RR0007').map((r) => r.bn)).toEqual(['108092008RR0007']);
    expect(filterTaxExemptCompanies(rows, '108092008').map((r) => r.bn)).toEqual(['108092008RR0001', '108092008RR0007']);
    expect(filterTaxExemptCompanies(rows, '108 092 008 rr0007').map((r) => r.bn)).toEqual(['108092008RR0007']);
    expect(filterTaxExemptCompanies(rows, '123456789-rr0001').map((r) => r.name)).toEqual(['A UNIQUE SOCIETY']);
  });

  test('the existing searches (name, industry, exemption type) behave exactly as before, order preserved', () => {
    expect(filterTaxExemptCompanies(rows, 'bishop')).toHaveLength(2);
    expect(filterTaxExemptCompanies(rows, 'health').map((r) => r.name)).toEqual(['A UNIQUE SOCIETY']);
    expect(filterTaxExemptCompanies(rows, 'charitable organization')).toHaveLength(3);
    expect(filterTaxExemptCompanies(rows, '')).toBe(rows);
    expect(filterTaxExemptCompanies(rows, '   ')).toBe(rows);
    expect(filterTaxExemptCompanies(rows, 'zzz-no-match')).toEqual([]);
  });

  test('very short digit fragments do not match every BN, and rows without a BN never match a BN query', () => {
    expect(filterTaxExemptCompanies(rows, '1')).toHaveLength(0);
    expect(filterTaxExemptCompanies(rows, 'rr0')).toHaveLength(0);
    const noBn = parse([rec('NO BN', undefined)]);
    expect(filterTaxExemptCompanies(noBn, '108092008')).toEqual([]);
  });
});

describe('src wiring (rendering is display-only)', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'App.js'), 'utf8').replace(/\r\n/g, '\n');

  test('the table and the mobile cards render the BN label under the name, only when present; the name itself is unchanged', () => {
    expect((app.match(/\{co\.bnLabel \?/g) || []).length).toBe(2);
    expect(app.includes('{co.name}\n                            {co.bnLabel ?')).toBe(true);
    expect(app.includes('title="CRA business number"')).toBe(true);
  });

  test('the modal search goes through the shared helper (so BN is searchable) and the placeholder mentions BN only when BNs exist', () => {
    expect(app.includes('const filtered = filterTaxExemptCompanies(companies, taxExemptSearch);')).toBe(true);
    expect(app.includes("companies.some((c) => c.bn) ? 'Search by name, industry, exemption type, or BN…'")).toBe(true);
  });

  test('rows are still numbered by position in the unchanged order (no re-sorting was introduced)', () => {
    expect(app.includes('<td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>')).toBe(true);
    const taxModal = app.slice(app.indexOf('const renderTaxExemptModal = () => {'), app.indexOf('const renderGrantsModal = () => {'));
    expect(taxModal.length).toBeGreaterThan(1000);
    expect(/\.sort\(/.test(taxModal)).toBe(false); // the tax modal never re-orders rows (boolean assertion: no huge diff output)
  });
});
