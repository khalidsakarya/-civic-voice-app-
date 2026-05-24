/**
 * Official source registry for Canadian provincial/territorial leader transparency.
 * Leaders from engine/data/subnational-phase3b-overlay.json (May 2026).
 */

const OVERLAY = require('../data/subnational-phase3b-overlay.json');

/** @param {string} id */
function leaderFromOverlay(id) {
  const row = OVERLAY[id] || {};
  return {
    leaderName: row.leader_name || '',
    leaderParty: row.leader_party || '',
    premierPage: row.officialWebsite || '',
  };
}

const BASE = Object.freeze({
  'CA-BC': {
    ...leaderFromOverlay('CA-BC'),
    regulatory_act: 'Members’ Conflict of Interest Act (BC)',
    regulatory_body: 'Conflict of Interest Commissioner (BC Legislature)',
    sources: {
      ethics_disclosures:
        'https://www.leg.bc.ca/about/accountability/members-disclosures/public-disclosure-statements',
      mla_remuneration:
        'https://www.leg.bc.ca/about/accountability/members-disclosures/mla-remuneration-and-expenses',
      elections: 'https://contributions.electionsbc.gov.bc.ca/pcs/Search.aspx',
      newsroom: 'https://news.gov.bc.ca/',
      news_rss: 'https://news.gov.bc.ca/feed',
      lobbying: 'https://lobbyistsregistrar.bc.ca/',
    },
    leader_match: /eby|premier/i,
    salary_strategy: 'bc_mla_premier_table',
  },
  'CA-AB': {
    ...leaderFromOverlay('CA-AB'),
    regulatory_act: 'Conflicts of Interest Act (Alberta)',
    regulatory_body: 'Office of the Ethics Commissioner (Alberta)',
    sources: {
      ethics:
        'https://www.assembly.ab.ca/roles/members-of-the-legislative-assembly/conflict-of-interest-commissioner',
      elections: 'https://www.elections.ab.ca/finance/contributions/',
      newsroom: 'https://www.alberta.ca/news',
      salary_csv: 'https://salaries.dataservices.alberta.ca/files/alberta-salary-disclosure.csv',
      salary_page: 'https://www.alberta.ca/salary-and-severance-disclosure-table',
      lobbying: 'https://www.alberta.ca/lobbyist-registry',
    },
    leader_match: /smith|premier/i,
    salary_strategy: 'ab_csv_no_premier_name',
  },
  'CA-SK': {
    ...leaderFromOverlay('CA-SK'),
    regulatory_act: 'The Conflict of Interest Act, 2019 (Saskatchewan)',
    regulatory_body: 'Conflict of Interest Commissioner (Saskatchewan)',
    sources: {
      ethics_disclosures: 'https://www.legassembly.sk.ca/mlas/mla-disclosure-statements/',
      elections: 'https://www.elections.sk.ca/reports-data/candidate-political-party-finances/',
      newsroom: 'https://www.saskatchewan.ca/government/news-and-media',
    },
    leader_match: /moe|premier/i,
  },
  'CA-MB': {
    ...leaderFromOverlay('CA-MB'),
    regulatory_act: 'The Legislative Assembly and Executive Council Conflict of Interest Act (Manitoba)',
    regulatory_body: 'Conflict of Interest Commissioner (Manitoba)',
    sources: {
      ethics: 'https://www.gov.mb.ca/oeci/',
      elections: 'https://www.electionsmanitoba.ca/en/Finance/Financial_Disclosure',
      newsroom: 'https://news.gov.mb.ca/',
      news_rss: 'https://news.gov.mb.ca/news/index.rss',
      salary: 'https://www.gov.mb.ca/finance/pubs/compensation/index.html',
    },
    leader_match: /kinew|premier/i,
    blocked_notes: ['Manitoba OECI legacy URL returns 404 content; compensation PDF path requires manual review.'],
  },
  'CA-QC': {
    ...leaderFromOverlay('CA-QC'),
    regulatory_act: 'Code d’éthique et de déontologie des membres de l’Assemblée nationale (Québec)',
    regulatory_body: 'Commissaire à l’éthique et à la déontologie (Québec)',
    sources: {
      ethics: 'https://www.ccei.qc.ca/fr/declarations/declarations-des-deputes/',
      elections:
        'https://www.electionsquebec.qc.ca/financement-depenses-et-contributions/recherche-sur-les-donateurs/',
      newsroom: 'https://www.premier-ministre.gouv.qc.ca/premier-ministre/nouvelles/',
      salary: 'https://www.tresor.gouv.qc.ca/documents-rapport/renseignements-sur-les-remunerations-des-hauts-responsables-de-letat/',
      salary_ckan: 'https://www.donneesquebec.ca/recherche/api/3/action/package_search?q=remuneration+hauts+responsables',
    },
    leader_match: /fr[ée]chette|premier|premi[eè]re-ministre/i,
    blocked_notes: ['CCEI portal may require manual browser access from some networks.'],
  },
  'CA-NB': {
    ...leaderFromOverlay('CA-NB'),
    regulatory_act: 'Conflict of Interest Act (New Brunswick)',
    regulatory_body: 'Conflict of Interest Commissioner (New Brunswick)',
    sources: {
      elections: 'https://www.electionsnb.ca/content/enb/en/political-financing/annual-financial-returns.html',
      newsroom: 'https://www.gnb.ca/en/news.html',
      premier: 'https://gnb.ca/en/org/office-of-the-premier.html',
    },
    leader_match: /holt|premier/i,
    blocked_notes: ['NB Conflict of Interest Commissioner public disclosure URL not machine-located in sync.'],
  },
  'CA-NS': {
    ...leaderFromOverlay('CA-NS'),
    regulatory_act: 'Conflict of Interest Act (Nova Scotia)',
    regulatory_body: 'Conflict of Interest Commissioner (Nova Scotia)',
    sources: {
      ethics: 'https://nslegislature.ca/about/conflict-of-interest-commissioner/public-disclosures',
      elections: 'https://www.electionsnovascotia.ca/',
      newsroom: 'https://novascotia.ca/news/',
    },
    leader_match: /houston|premier/i,
    blocked_notes: ['Elections Nova Scotia contribution search returns SPA shell from automated fetch.'],
  },
  'CA-PE': {
    ...leaderFromOverlay('CA-PE'),
    regulatory_act: 'Conflict of Interest Act (Prince Edward Island)',
    regulatory_body: 'Conflict of Interest Commissioner (PEI)',
    sources: {
      ethics: 'https://www.assembly.pe.ca/conflict-of-interest/disclosures',
      elections: 'https://www.electionspei.ca/en/financialinformation',
      newsroom: 'https://www.princeedwardisland.ca/en/news',
      salary: 'https://www.princeedwardisland.ca/en/information/finance/public-sector-salary-disclosure',
    },
    leader_match: /king|premier/i,
  },
  'CA-NL': {
    ...leaderFromOverlay('CA-NL'),
    regulatory_act: 'Conflict of Interest Act, 2022 (Newfoundland and Labrador)',
    regulatory_body: 'Commissioner for Legislative Standards / Integrity Commissioner (NL)',
    sources: {
      ethics: 'https://www.assembly.nl.ca/',
      elections: 'https://www.elections.gov.nl.ca/resources/political-finance-reports/',
      newsroom: 'https://www.gov.nl.ca/releases/',
      premier_news: 'https://www.premier.gov.nl.ca/news/',
      salary: 'https://www.assembly.nl.ca/Members/Compensation/',
    },
    leader_match: /furey|premier/i,
  },
  'CA-YT': {
    ...leaderFromOverlay('CA-YT'),
    regulatory_act: 'Conflict of Interest (General) Act (Yukon)',
    regulatory_body: 'Conflict of Interest Commissioner (Yukon)',
    sources: {
      ethics: 'https://yukon.ca/en/elected-officials/conflict-interest-commissioner',
      elections: 'https://electionsyukon.ca/en/financial-reporting',
      newsroom: 'https://yukon.ca/en/news',
      salary: 'https://yukon.ca/en/public-sector-compensation-disclosure',
    },
    leader_match: /pillai|premier/i,
    blocked_notes: ['yukon.ca and electionsyukon.ca return HTTP 403 to automated fetch — manual review required.'],
  },
  'CA-NT': {
    ...leaderFromOverlay('CA-NT'),
    regulatory_act: 'Conflict of Interest Act (Northwest Territories)',
    regulatory_body: 'Integrity Commissioner (NWT)',
    sources: {
      ethics: 'https://www.ntassembly.ca/integrity-commissioner',
      elections: 'https://www.electionsnwt.ca/en/financial-reporting',
      newsroom: 'https://www.gov.nt.ca/en/newsroom/news-releases',
      salary: 'https://www.fin.gov.nt.ca/en/services/public-sector-compensation-disclosure',
    },
    leader_match: /simpson|premier/i,
  },
  'CA-NU': {
    ...leaderFromOverlay('CA-NU'),
    regulatory_act: 'Integrity Act (Nunavut)',
    regulatory_body: 'Integrity Commissioner (Nunavut)',
    sources: {
      ethics: 'https://assembly.nu.ca/about/conflict-interest-commissioner',
      elections: 'https://www.elections.nu.ca/',
      premier_news: 'https://www.premier.gov.nu.ca/news',
      salary: 'https://www.gov.nu.ca/finance/information/public-sector-compensation-disclosure',
    },
    leader_match: /main|premier/i,
    blocked_notes: ['gov.nu.ca returns HTTP 403; some assembly pages return soft 404 from automated fetch.'],
  },
});

const CANADIAN_PROVINCE_IDS = Object.freeze(Object.keys(BASE));

module.exports = {
  CANADIAN_PROVINCE_IDS,
  getProvincialConfig: (id) => BASE[id] || null,
};
