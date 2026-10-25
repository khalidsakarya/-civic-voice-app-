import {
  CA_FED_CONTRACT_ID_FIRST,
  CA_FED_CONTRACT_ID_LAST,
  CA_FED_CONTRACTS_PAGE_SIZE,
  caFederalContractStatus,
  caFederalContractsScope,
  caFederalContractsAllLoaded,
  formatCadCompact,
} from './caFederalContracts';

// Pure-function tests only: no Firebase, no network, no component rendering.

describe('caFederalContractStatus', () => {
  const now = new Date('2026-10-25T12:00:00Z');

  test('end date in the future is active', () => {
    expect(caFederalContractStatus({ end_date: '2029-03-31' }, now)).toBe('active');
  });
  test('end date in the past is completed', () => {
    expect(caFederalContractStatus({ end_date: '2026-03-31' }, now)).toBe('completed');
  });
  test('a contract ending today is still active', () => {
    expect(caFederalContractStatus({ end_date: '2026-10-25' }, now)).toBe('active');
  });
  test('status flips with time even though the document never changes', () => {
    const doc = { end_date: '2026-12-31' };
    expect(caFederalContractStatus(doc, new Date('2026-12-30T00:00:00Z'))).toBe('active');
    expect(caFederalContractStatus(doc, new Date('2027-01-02T00:00:00Z'))).toBe('completed');
  });
  test('an explicit stored status wins over the date', () => {
    expect(caFederalContractStatus({ status: 'Completed', end_date: '2040-01-01' }, now)).toBe('completed');
  });
  test('no status and no usable date gives null (neither badge shown)', () => {
    expect(caFederalContractStatus({}, now)).toBeNull();
    expect(caFederalContractStatus({ end_date: 'not a date' }, now)).toBeNull();
    expect(caFederalContractStatus(null, now)).toBeNull();
  });
});

describe('caFederalContractsScope', () => {
  const doc = {
    contractor_name: 'A',
    selection_size: 100,
    selection_total_value: 96051357629.77,
    selection_label: '100 largest federal contracts disclosed in fiscal year 2025–26',
    selection_fiscal_year: '2025-2026',
    selection_period: 'April 1, 2025 – March 31, 2026',
    selection_basis: 'Total disclosed contract value',
    source: 'TBS — Proactive Publication - Contracts',
    source_url: 'https://open.canada.ca/data/en/dataset/x',
  };
  test('reads the scope from the documents themselves', () => {
    const s = caFederalContractsScope([doc]);
    expect(s.size).toBe(100);
    expect(s.totalValue).toBeCloseTo(96051357629.77, 2);
    expect(s.label).toMatch(/100 largest/);
    expect(s.period).toMatch(/2025/);
  });
  test('is null until a document with selection metadata is loaded', () => {
    expect(caFederalContractsScope([])).toBeNull();
    expect(caFederalContractsScope(undefined)).toBeNull();
    expect(caFederalContractsScope([{ contractor_name: 'legacy doc without metadata' }])).toBeNull();
  });
  test('skips a leading legacy document and still finds the metadata', () => {
    expect(caFederalContractsScope([{ contractor_name: 'x' }, doc]).size).toBe(100);
  });
});

describe('caFederalContractsAllLoaded', () => {
  test('a short page means everything has been read', () => {
    expect(caFederalContractsAllLoaded(35, 15, 100)).toBe(true);
  });
  test('a full page with more to go is not complete', () => {
    expect(caFederalContractsAllLoaded(20, 20, 100)).toBe(false);
  });
  test('five full pages of a 100-document selection stop without a wasted empty read', () => {
    let loaded = 0;
    let done = false;
    let reads = 0;
    while (!done) {
      loaded += CA_FED_CONTRACTS_PAGE_SIZE;
      reads += 1;
      done = caFederalContractsAllLoaded(loaded, CA_FED_CONTRACTS_PAGE_SIZE, 100);
    }
    expect(reads).toBe(5);
    expect(loaded).toBe(100);
  });
  test('without a known selection size, a full page keeps going', () => {
    expect(caFederalContractsAllLoaded(20, 20, null)).toBe(false);
  });
});

describe('read-cost invariants', () => {
  test('the first page is 20 documents, not the whole selection', () => {
    expect(CA_FED_CONTRACTS_PAGE_SIZE).toBe(20);
  });
  test('the id range brackets rank 001 to 100 and nothing from other jurisdictions', () => {
    expect(CA_FED_CONTRACT_ID_FIRST < 'ca-fed-contract-100').toBe(true);
    expect('ca-fed-contract-100' < CA_FED_CONTRACT_ID_LAST).toBe(true);
    ['us-contract-001', 'uk-contract-001', 'au-contract-001', 'ca-grant-001', 'CA-FED-contract-001'].forEach((id) => {
      expect(id >= CA_FED_CONTRACT_ID_FIRST && id <= CA_FED_CONTRACT_ID_LAST).toBe(false);
    });
  });
  test('zero-padded ranks sort in rank order as strings', () => {
    const ids = [100, 2, 10, 1, 99].map((n) => `ca-fed-contract-${String(n).padStart(3, '0')}`);
    expect([...ids].sort()).toEqual(['ca-fed-contract-001', 'ca-fed-contract-002', 'ca-fed-contract-010', 'ca-fed-contract-099', 'ca-fed-contract-100']);
  });
});

describe('formatCadCompact', () => {
  test('formats billions, millions and plain amounts', () => {
    expect(formatCadCompact(11219370646)).toBe('CA$11.2B');
    expect(formatCadCompact(109064540.54)).toBe('CA$109.1M');
    expect(formatCadCompact(850000)).toBe('CA$850,000');
  });
  test('missing or zero values give null', () => {
    expect(formatCadCompact(null)).toBeNull();
    expect(formatCadCompact(0)).toBeNull();
    expect(formatCadCompact('abc')).toBeNull();
  });
});
