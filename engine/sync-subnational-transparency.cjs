/**
 * Sync subnational transparency modal collections (CA-ON template) for additional jurisdictions.
 *
 * Collections (doc id = jurisdiction id, e.g. US-CA):
 *   subnational_economic_social_stats
 *   subnational_tax_exempt_entities
 *   subnational_grants
 *
 * Usage:
 *   node engine/sync-subnational-transparency.cjs              # dry-run (default)
 *   node engine/sync-subnational-transparency.cjs --write      # merge to Firestore
 *   node engine/sync-subnational-transparency.cjs --write --only=US-CA,AU-NSW
 *
 * Requires Firebase Admin credentials (see engine/firebase-admin-init.cjs).
 */

const {
  tryGetFirestore,
  describeCredentialSource,
  formatPlaceholderCredentialMessage,
} = require('./firebase-admin-init.cjs');
const {
  mergeTransparencyDoc,
  hasEconomicPayload,
  hasTaxPayload,
  hasGrantsPayload,
} = require('./lib/subnational-transparency-shared.cjs');
const usCa = require('./lib/subnational-transparency-us-ca.cjs');
const caOn = require('./lib/subnational-transparency-ca-on.cjs');
const auNsw = require('./lib/subnational-transparency-au-nsw.cjs');
const ukLon = require('./lib/subnational-transparency-uk-lon.cjs');

const COL_ECON = 'subnational_economic_social_stats';
const COL_TAX = 'subnational_tax_exempt_entities';
const COL_GRANTS = 'subnational_grants';

const MODULES = {
  'CA-ON': caOn,
  'US-CA': usCa,
  'AU-NSW': auNsw,
  'UK-ENG-LON': ukLon,
};

function parseArgs(argv) {
  const write = argv.includes('--write');
  const onlyArg = argv.find((a) => a.startsWith('--only='));
  const only = onlyArg
    ? onlyArg
        .slice('--only='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : Object.keys(MODULES);
  return { write, only };
}

function reportingPeriodEconomic(doc) {
  return (
    doc.budget_distribution_source ||
    doc.crime_reporting_period ||
    doc.unemployment_reporting_period ||
    doc.fiscal_year ||
    doc.reporting_period ||
    '(see series metadata fields)'
  );
}

function reportingPeriodTax(doc) {
  return doc.data_source || doc.source || doc.note || '(see data_source)';
}

function reportingPeriodGrants(doc) {
  return doc.fiscal_year
    ? `FY ${doc.fiscal_year}`
    : doc.reporting_period || doc.data_source || '(see fiscal_year / data_source)';
}

async function syncJurisdiction(mod, db, write) {
  const id = mod.JURISDICTION_ID;
  const report = {
    jurisdictionId: id,
    economic: { written: false, skipped: true, reportingPeriod: null, sourceUrl: null },
    tax: { written: false, skipped: true, reportingPeriod: null, sourceUrl: null, recordCount: 0 },
    grants: { written: false, skipped: true, reportingPeriod: null, sourceUrl: null, recordCount: 0 },
    unavailable: [],
  };

  console.log(`\n[sync-subnational] === ${id} ===`);

  let economicDoc = null;
  try {
    console.log(`[sync-subnational] ${id} fetch economic…`);
    economicDoc = await mod.buildEconomic();
    if (hasEconomicPayload(economicDoc)) {
      report.economic.reportingPeriod = reportingPeriodEconomic(economicDoc);
      report.economic.sourceUrl =
        economicDoc.budget_distribution_url ||
        economicDoc.crime_url ||
        economicDoc.unemployment_source_url ||
        economicDoc.unemployment_url ||
        null;
      if (write) {
        const r = await mergeTransparencyDoc(db, COL_ECON, id, economicDoc, 'economic');
        report.economic.written = r.written;
        report.economic.skipped = !r.written;
      } else {
        report.economic.skipped = false;
        console.log(`[sync-subnational] ${id} economic: ready (dry-run)`);
      }
    } else {
      report.unavailable.push('economic (no series parsed)');
    }
  } catch (err) {
    report.unavailable.push(`economic (${err.message})`);
    console.error(`[sync-subnational] ${id} economic error:`, err.message);
  }

  let taxDoc = null;
  try {
    console.log(`[sync-subnational] ${id} fetch tax exempt…`);
    taxDoc = await mod.buildTax();
    if (taxDoc && hasTaxPayload(taxDoc)) {
      report.tax.reportingPeriod = reportingPeriodTax(taxDoc);
      report.tax.sourceUrl = taxDoc.source_url || null;
      report.tax.recordCount = taxDoc.records.length;
      if (write) {
        const r = await mergeTransparencyDoc(db, COL_TAX, id, taxDoc, 'tax');
        report.tax.written = r.written;
        report.tax.skipped = !r.written;
      } else {
        report.tax.skipped = false;
        console.log(`[sync-subnational] ${id} tax: ${taxDoc.records.length} records (dry-run)`);
      }
    } else {
      report.unavailable.push('tax exempt / charities');
    }
  } catch (err) {
    report.unavailable.push(`tax exempt (${err.message})`);
    console.error(`[sync-subnational] ${id} tax error:`, err.message);
  }

  let grantsDoc = null;
  try {
    console.log(`[sync-subnational] ${id} fetch grants…`);
    grantsDoc = await mod.buildGrants();
    if (grantsDoc && hasGrantsPayload(grantsDoc)) {
      report.grants.reportingPeriod = reportingPeriodGrants(grantsDoc);
      report.grants.sourceUrl = grantsDoc.source_url || null;
      report.grants.recordCount = grantsDoc.records.length;
      if (write) {
        const r = await mergeTransparencyDoc(db, COL_GRANTS, id, grantsDoc, 'grants');
        report.grants.written = r.written;
        report.grants.skipped = !r.written;
      } else {
        report.grants.skipped = false;
        console.log(`[sync-subnational] ${id} grants: ${grantsDoc.records.length} records (dry-run)`);
      }
    } else {
      report.unavailable.push('grants / public funding');
    }
  } catch (err) {
    report.unavailable.push(`grants (${err.message})`);
    console.error(`[sync-subnational] ${id} grants error:`, err.message);
  }

  return report;
}

async function main() {
  const { write, only } = parseArgs(process.argv.slice(2));
  console.log('[sync-subnational] mode:', write ? 'WRITE (merge)' : 'DRY-RUN');
  console.log('[sync-subnational] jurisdictions:', only.join(', '));

  const db = write ? tryGetFirestore() : null;
  if (write && !db) {
    const pm = formatPlaceholderCredentialMessage();
    console.error('[sync-subnational] Firestore unavailable. Credentials:', describeCredentialSource());
    if (pm) console.error(`[sync-subnational] ${pm}`);
    process.exit(1);
  }

  const reports = [];
  for (let i = 0; i < only.length; i += 1) {
    const key = only[i];
    const mod = MODULES[key];
    if (!mod) {
      console.warn(`[sync-subnational] unknown jurisdiction: ${key}`);
      continue;
    }
    reports.push(await syncJurisdiction(mod, db, write));
  }

  console.log('\n[sync-subnational] ========= SUMMARY =========');
  for (let i = 0; i < reports.length; i += 1) {
    const r = reports[i];
    console.log(`\n${r.jurisdictionId}`);
    console.log(
      '  economic:',
      r.economic.skipped && !r.economic.written ? 'not written' : write ? 'merged' : 'ready',
      '| period:',
      r.economic.reportingPeriod || 'n/a',
    );
    console.log('  economic source:', r.economic.sourceUrl || 'n/a');
    console.log(
      '  tax:',
      r.tax.skipped && !r.tax.written ? 'not written' : write ? 'merged' : 'ready',
      '| records:',
      r.tax.recordCount,
      '| period:',
      r.tax.reportingPeriod || 'n/a',
    );
    console.log('  tax source:', r.tax.sourceUrl || 'n/a');
    console.log(
      '  grants:',
      r.grants.skipped && !r.grants.written ? 'not written' : write ? 'merged' : 'ready',
      '| records:',
      r.grants.recordCount,
      '| period:',
      r.grants.reportingPeriod || 'n/a',
    );
    console.log('  grants source:', r.grants.sourceUrl || 'n/a');
    if (r.unavailable.length) {
      console.log('  unavailable:', r.unavailable.join('; '));
    }
  }
  console.log('\n[sync-subnational] done.');
}

main().catch((err) => {
  console.error('[sync-subnational] fatal:', err);
  process.exit(1);
});
