/**
 * Extract Cal-Access lobbying rows targeting Governor / Office of the Governor.
 * Official source: SOS Cal-Access raw export (LEMP_CD — agencies to be lobbied).
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { trim } = require('./subnational-transparency-shared.cjs');

const execFileAsync = promisify(execFile);

const CALACCESS_ZIP_URL = 'https://campaignfinance.cdn.sos.ca.gov/dbwebexport.zip';
const CACHE_DIR = path.join(__dirname, '..', 'cache', 'calaccess');
const ZIP_PATH = path.join(CACHE_DIR, 'dbwebexport.zip');
const LEMP_PATH = path.join(CACHE_DIR, 'LEMP_CD.tsv');

const GOVERNOR_TARGET_RE =
  /\bgovernor\b|office of the governor|governor's office|governor’s office|chief of staff to the governor|executive branch/i;

const SOURCE_PORTAL = 'http://cal-access.sos.ca.gov/Lobbying/';
const SOURCE_RAW = 'https://sos.ca.gov/campaign-lobbying/helpful-resources/raw-data-campaign-finance-and-lobbying-activity';
const NOT_DISCLOSED = 'Not disclosed in official filing.';

function splitTsvLine(line) {
  return line.split('\t');
}

function streamDownload(url, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    const req = https.get(url, { headers: { 'User-Agent': 'CivicVoice-CalAccess/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        streamDownload(res.headers.location, dest).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        reject(new Error(`HTTP ${res.statusCode} downloading ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });
    req.on('error', reject);
    req.setTimeout(900000, () => {
      req.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

async function extractLempFromZip(zipPath, outPath) {
  const ps = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead('${zipPath.replace(/'/g, "''")}')
$entry = $zip.Entries | Where-Object { $_.Name -eq 'LEMP_CD.tsv' -or $_.FullName -like '*/LEMP_CD.tsv' } | Select-Object -First 1
if (-not $entry) { $zip.Dispose(); throw 'LEMP_CD.tsv not found in zip' }
[IO.Compression.ZipFileExtensions]::ExtractToFile($entry, '${outPath.replace(/'/g, "''")}', $true)
$zip.Dispose()
`;
  await execFileAsync('powershell', ['-NoProfile', '-Command', ps], { maxBuffer: 20 * 1024 * 1024 });
}

async function ensureLempTsv() {
  if (fs.existsSync(LEMP_PATH) && fs.statSync(LEMP_PATH).size > 1000) return LEMP_PATH;

  if (!fs.existsSync(ZIP_PATH)) {
    await streamDownload(CALACCESS_ZIP_URL, ZIP_PATH);
  }
  await extractLempFromZip(ZIP_PATH, LEMP_PATH);
  return LEMP_PATH;
}

function mapLempRow(cols, header) {
  const rec = {};
  for (let i = 0; i < header.length; i += 1) {
    rec[header[i]] = cols[i] != null ? trim(cols[i]) : '';
  }
  return rec;
}

function rowFromLemp(rec) {
  const agency = trim(rec.AGENCYLIST);
  if (!agency || !GOVERNOR_TARGET_RE.test(agency)) return null;

  const client = [rec.CLI_NAMT, rec.CLI_NAMF, rec.CLI_NAML, rec.CLI_NAMS].filter(Boolean).join(' ').trim();
  const firm = trim(rec.SUB_NAME);
  const lobbyist = firm || client || NOT_DISCLOSED;

  return {
    lobbyist_or_firm: lobbyist,
    client_employer: client || trim(rec.DESCRIP) || NOT_DISCLOSED,
    target_office_or_person: agency,
    issue_area: trim(rec.DESCRIP) || NOT_DISCLOSED,
    amount_paid: NOT_DISCLOSED,
    amount_paid_note: 'Contract registration (LEMP_CD); payment amounts are reported on separate Cal-Access lobbying payment filings.',
    reporting_period: trim(rec.CON_PERIOD) || trim(rec.EFF_DATE) || NOT_DISCLOSED,
    source_url: SOURCE_RAW,
    cal_access_portal: SOURCE_PORTAL,
    filing_id: rec.FILING_ID || '',
    form_type: rec.FORM_TYPE || '',
  };
}

/**
 * @param {{ maxRows?: number, skipDownload?: boolean }} [opts]
 */
async function fetchGovernorLobbyingRows(opts = {}) {
  const maxRows = opts.maxRows ?? 200;

  if (opts.skipDownload && !fs.existsSync(LEMP_PATH)) {
    return {
      rows: [],
      status: 'no_official_target_specific_lobbying_records_found',
      note: 'Cal-Access LEMP_CD export not cached. Run: node engine/scripts/prefetch-calaccess-lobby-cache.cjs',
      source_url: SOURCE_RAW,
    };
  }

  try {
    const tsvPath = await ensureLempTsv();
    const text = fs.readFileSync(tsvPath, 'utf8');
    const lines = text.split(/\r?\n/).filter((l) => l.length);
    if (lines.length < 2) {
      return {
        rows: [],
        status: 'no_official_target_specific_lobbying_records_found',
        note: 'LEMP_CD file empty or unreadable.',
        source_url: SOURCE_RAW,
      };
    }

    const header = splitTsvLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length && rows.length < maxRows; i += 1) {
      const cols = splitTsvLine(lines[i]);
      const rec = mapLempRow(cols, header);
      const row = rowFromLemp(rec);
      if (row) rows.push(row);
    }

    if (!rows.length) {
      return {
        rows: [],
        status: 'no_official_target_specific_lobbying_records_found',
        note: 'No Cal-Access LEMP_CD registrations list Governor or Office of the Governor as a lobbying target agency.',
        source_url: SOURCE_RAW,
      };
    }

    return {
      rows,
      status: 'filed',
      row_count: rows.length,
      data_as_of: 'Cal-Access dbwebexport (LEMP_CD)',
      source_url: SOURCE_RAW,
      note: `${rows.length} official lobbying contract registration row(s) naming the Governor or Office of the Governor as a target agency (LEMP_CD.AGENCYLIST).`,
    };
  } catch (err) {
    return {
      rows: [],
      status: 'official_data_requires_manual_review',
      error: trim(err.message),
      note: 'Cal-Access raw export could not be downloaded or parsed in this environment.',
      portal: SOURCE_PORTAL,
      raw_data_url: SOURCE_RAW,
      source_url: SOURCE_RAW,
    };
  }
}

module.exports = {
  CALACCESS_ZIP_URL,
  CACHE_DIR,
  fetchGovernorLobbyingRows,
  GOVERNOR_TARGET_RE,
};
