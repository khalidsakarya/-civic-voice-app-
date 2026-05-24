/**
 * Official source registry for US state governor leader transparency.
 * Phase 1 pilots: US-TX, US-FL, US-NY, US-IL, US-PA (plus US-CA in dedicated module).
 * Leaders from engine/data/subnational-phase3b-overlay.json.
 */

const OVERLAY = require('../data/subnational-phase3b-overlay.json');

/** @param {string} id */
function leaderFromOverlay(id) {
  const row = OVERLAY[id] || {};
  const parts = String(row.leader_name || '').trim().split(/\s+/);
  return {
    leaderName: row.leader_name || '',
    leaderFirst: parts[0] || '',
    leaderLast: parts[parts.length - 1] || '',
    leaderParty: row.leader_party || '',
    governorPage: row.officialWebsite || '',
  };
}

/** @param {string} lastName */
function leaderMatch(lastName) {
  const esc = String(lastName || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${esc}|governor|gov\\.`, 'i');
}

const PHASE1_IDS = Object.freeze(['US-TX', 'US-FL', 'US-NY', 'US-IL', 'US-PA']);

const BATCH2_IDS = Object.freeze([
  'US-OH',
  'US-MI',
  'US-GA',
  'US-NC',
  'US-NJ',
  'US-VA',
  'US-WA',
  'US-AZ',
  'US-MA',
  'US-TN',
]);

const CONFIGURED_US_STATE_IDS = Object.freeze([...PHASE1_IDS, ...BATCH2_IDS]);

const PILOT = Object.freeze({
  'US-TX': {
    ...leaderFromOverlay('US-TX'),
    regulatory_act: 'Texas Government Code Chapter 572 — Personal Financial Statement',
    regulatory_body: 'Texas Ethics Commission',
    sources: {
      governor: 'https://gov.texas.gov/governor',
      cabinet: 'https://gov.texas.gov/organization',
      cabinet_alt: 'https://gov.texas.gov/organization/appointments/positions',
      ethics: 'https://www.ethics.state.tx.us/search/QuickViewReport.php',
      ethics_pfs: 'https://www.ethics.state.tx.us/filinginfo/pfs/',
      campaign_finance: 'https://www.ethics.state.tx.us/search/cf/',
      lobbying: 'https://www.ethics.state.tx.us/search/lobby/',
      newsroom: 'https://gov.texas.gov/news',
      news_rss: 'https://gov.texas.gov/news/rss',
      salary: 'https://www.lbb.state.tx.us/Pages/Publications.aspx',
    },
    leader_match: leaderMatch('Abbott'),
    disclosure_strategy: 'tx_tec_no_public_pfs',
    salary_strategy: 'tx_statutory_manual',
    campaign_strategy: 'tec_cf_portal',
    lobbying_strategy: 'tec_lobby_portal',
    news_strategy: 'rss',
    cabinet_strategy: 'html_js_heavy',
    blocked_notes: [
      'Texas Ethics Commission: Personal Financial Statements are not published online; copies require an Open Records Request (QuickViewReport.php).',
      'Governor cabinet/appointments pages are client-rendered; member names not exposed in static HTML.',
    ],
  },
  'US-FL': {
    ...leaderFromOverlay('US-FL'),
    regulatory_act: 'Florida Code of Ethics — Form 6 Full and Public Disclosure of Financial Interests',
    regulatory_body: 'Florida Commission on Ethics (EFDMS)',
    sources: {
      governor: 'https://www.flgov.com/',
      cabinet: 'https://www.flgov.com/',
      ethics: 'https://disclosure.floridaethics.gov/PublicSearch/Filings',
      ethics_commission: 'https://www.ethics.state.fl.us/',
      elections: 'https://dos.fl.gov/elections/candidates-committees/',
      lobbying: 'https://www.lobbyistregister.dos.state.fl.us/',
      newsroom: 'https://www.flgov.com/eog/news/press',
    },
    leader_match: leaderMatch('DeSantis'),
    disclosure_strategy: 'fl_efdms_js',
    salary_strategy: 'fl_statutory_manual',
    campaign_strategy: 'fl_elections_portal',
    lobbying_strategy: 'fl_lobby_portal',
    news_strategy: 'fl_press_paths',
    cabinet_strategy: 'html_js_heavy',
    blocked_notes: [
      'Florida EFDMS public search renders filer results client-side; automated fetch returns empty grid without browser session.',
      'Executive Office cabinet roster not available as static HTML on flgov.com.',
    ],
  },
  'US-NY': {
    ...leaderFromOverlay('US-NY'),
    regulatory_act: 'Public Officers Law — annual statement of financial disclosure (JCOPE / COELIG)',
    regulatory_body: 'Commission on Ethics and Lobbying in Government (COELIG)',
    sources: {
      governor: 'https://www.governor.ny.gov/',
      cabinet: 'https://www.governor.ny.gov/',
      ethics: 'https://ethics.ny.gov/financial-disclosure',
      ethics_search: 'https://apps.ethics.ny.gov/public/search/FinancialDisclosure',
      elections: 'https://www.elections.ny.gov/',
      lobbying: 'https://apps.ethics.ny.gov/public/search/Lobbying',
      newsroom: 'https://www.governor.ny.gov/pressroom',
    },
    leader_match: leaderMatch('Hochul'),
    disclosure_strategy: 'ny_coelig_portal',
    salary_strategy: 'ny_statutory_manual',
    campaign_strategy: 'ny_elections_portal',
    lobbying_strategy: 'ny_coelig_lobby',
    news_strategy: 'ny_press_paths',
    cabinet_strategy: 'html_js_heavy',
    blocked_notes: [
      'apps.ethics.ny.gov financial disclosure search blocked or unreachable from automated fetch; ethics.ny.gov portal is JS-heavy.',
      'Executive chamber leadership page not machine-readable as cabinet roster.',
    ],
  },
  'US-IL': {
    ...leaderFromOverlay('US-IL'),
    regulatory_act: 'Illinois Governmental Ethics Act — Statement of Economic Interests',
    regulatory_body: 'Illinois Secretary of State / State Board of Elections (SEI filings)',
    sources: {
      governor: 'https://www.illinois.gov/gov/',
      cabinet: 'https://www.illinois.gov/gov/leadership.html',
      cabinet_alt: 'https://www2.illinois.gov/agencies/Pages/default.aspx',
      ethics: 'https://www.elections.il.gov/EconomicInterestStatements.aspx',
      ethics_alt: 'https://www.ilsos.gov/',
      campaign_finance: 'https://www.elections.il.gov/CampaignDisclosure/ContributionSearchByCandidates.aspx',
      campaign_finance_alt:
        'https://www.elections.il.gov/CampaignDisclosure/ContributionSearchByAllContributions.aspx',
      lobbying: 'https://www2.illinois.gov/sites/lobby/',
      newsroom: 'https://www.illinois.gov/gov/newsroom/all-news.html',
      newsroom_alt: 'https://gov-pritzker-newsroom.prezly.com/',
      salary: 'https://www2.illinois.gov/cms/employees/employee/Pages/EmployeeSalary.aspx',
    },
    leader_match: leaderMatch('Pritzker'),
    disclosure_strategy: 'il_sei_portal',
    salary_strategy: 'il_cms_manual',
    campaign_strategy: 'il_elections_asp',
    lobbying_strategy: 'il_lobby_portal',
    news_strategy: 'il_prezly_links',
    cabinet_strategy: 'html_js_heavy',
    blocked_notes: [
      'Illinois EconomicInterestStatements.aspx returns error shell; SEI PDF index requires manual portal navigation.',
      'Governor leadership/agency pages are client-rendered without static cabinet names.',
    ],
  },
  'US-PA': {
    ...leaderFromOverlay('US-PA'),
    regulatory_act: 'Pennsylvania Ethics Act — Statement of Financial Interests (Form SFI)',
    regulatory_body: 'Pennsylvania State Ethics Commission',
    sources: {
      governor: 'https://www.governor.pa.gov/',
      cabinet: 'https://www.governor.pa.gov/cabinet/',
      cabinet_alt: 'https://www.pa.gov/agencies/',
      ethics: 'https://www.ethics.pa.gov/Resources/Pages/Statement-of-Financial-Interests.aspx',
      ethics_search:
        'https://www.ethics.pa.gov/Resources/Pages/Search-Financial-Interest-Statements.aspx',
      elections: 'https://www.dos.pa.gov/VotingElections/CandidatesCommittees/CampaignFinance/Pages/default.aspx',
      lobbying: 'https://www.ethics.pa.gov/Resources/Pages/Lobbying-Disclosure.aspx',
      newsroom: 'https://www.governor.pa.gov/newsroom/',
      newsroom_alt: 'https://www.pa.gov/governor/newsroom',
      salary: 'https://www.pa.gov/agencies/employment-compensation-and-benefits/compensation.html',
    },
    leader_match: leaderMatch('Shapiro'),
    disclosure_strategy: 'pa_ethics_portal',
    salary_strategy: 'pa_compensation_manual',
    campaign_strategy: 'pa_dos_portal',
    lobbying_strategy: 'pa_ethics_lobby',
    news_strategy: 'html_newsroom',
    cabinet_strategy: 'html_js_heavy',
    blocked_notes: [
      'Pennsylvania SFI search portal is JS-heavy; automated fetch cannot retrieve individual asset rows.',
      'Governor cabinet page renders member cards client-side.',
    ],
  },
  'US-OH': {
    ...leaderFromOverlay('US-OH'),
    regulatory_act: 'Ohio Revised Code — financial disclosure for public officials',
    regulatory_body: 'Ohio Ethics Commission',
    sources: {
      governor: 'https://governor.ohio.gov/',
      cabinet: 'https://governor.ohio.gov/about-governor/executive-team',
      ethics: 'https://ohio.gov/government/resources/ethics',
      ethics_search: 'https://www.ethics.ohio.gov/financial-disclosure',
      campaign_finance: 'https://www.ohiosos.gov/campaign-finance/',
      lobbying: 'https://www.ohio.gov/government/lobbying',
      newsroom: 'https://governor.ohio.gov/media/news',
    },
    leader_match: leaderMatch('DeWine'),
    disclosure_strategy: 'oh_ethics_portal',
    salary_strategy: 'oh_statutory_manual',
    campaign_strategy: 'oh_sos_portal',
    lobbying_strategy: 'oh_lobby_portal',
    news_strategy: 'oh_portal_news',
    cabinet_strategy: 'html_js_heavy',
    blocked_notes: [
      'ethics.ohio.gov returns WAF “Request Rejected” to automated fetch.',
      'ohiosos.gov campaign finance returns HTTP 403 from automated fetch.',
    ],
  },
  'US-MI': {
    ...leaderFromOverlay('US-MI'),
    regulatory_act: 'Michigan Campaign Finance Act — Personal Financial Disclosure',
    regulatory_body: 'Michigan Department of State (Bureau of Elections)',
    sources: {
      governor: 'https://www.michigan.gov/governor/',
      cabinet: 'https://www.michigan.gov/governor/',
      ethics: 'https://www.michigan.gov/sos/elections/disclosure/personal-financial-disclosure',
      campaign_finance: 'https://www.michigan.gov/sos/elections/disclosure/cfr',
      lobbying: 'https://www.michigan.gov/sos/elections/disclosure/lobby',
      newsroom: 'https://www.michigan.gov/governor/',
    },
    leader_match: leaderMatch('Whitmer'),
    disclosure_strategy: 'mi_pfd_portal',
    salary_strategy: 'mi_statutory_manual',
    campaign_strategy: 'mi_sos_cfr',
    lobbying_strategy: 'mi_sos_lobby',
    news_strategy: 'html_newsroom',
    cabinet_strategy: 'html_js_heavy',
    blocked_notes: [
      'Governor executive team page not at expected path; cabinet roster requires manual review on michigan.gov.',
    ],
  },
  'US-GA': {
    ...leaderFromOverlay('US-GA'),
    regulatory_act: 'Georgia Government Transparency and Campaign Finance Act — financial disclosure',
    regulatory_body: 'Georgia Government Transparency & Campaign Finance Commission (ethics.ga.gov)',
    sources: {
      governor: 'https://gov.georgia.gov/',
      cabinet: 'https://gov.georgia.gov/',
      ethics: 'https://ethics.ga.gov/',
      ethics_search: 'https://media.ethics.ga.gov/Search/Financial/Financial_ByName.aspx',
      ethics_login: 'https://recordsearch.ethics.ga.gov/login',
      campaign_finance: 'https://media.ethics.ga.gov/Search/Campaign/Campaign_ByName.aspx',
      lobbying: 'https://ethics.ga.gov/lobbyist-reporting/',
      newsroom: 'https://gov.georgia.gov/press-releases',
    },
    leader_match: leaderMatch('Kemp'),
    disclosure_strategy: 'ga_recordsearch',
    salary_strategy: 'ga_statutory_manual',
    campaign_strategy: 'ga_ethics_media',
    lobbying_strategy: 'ga_lobby_portal',
    news_strategy: 'html_newsroom',
    cabinet_strategy: 'html_js_heavy',
    blocked_notes: [
      'recordsearch.ethics.ga.gov requires login for filer-specific disclosure PDFs.',
      'gov.georgia.gov press and organization pages are client-rendered (Drupal/SPA).',
    ],
  },
  'US-NC': {
    ...leaderFromOverlay('US-NC'),
    regulatory_act: 'North Carolina State Government Ethics Act — Statement of Economic Interest',
    regulatory_body: 'North Carolina State Board of Elections / ethics programs',
    sources: {
      governor: 'https://governor.nc.gov/',
      cabinet: 'https://governor.nc.gov/',
      ethics: 'https://www.ncsbe.gov/results-data',
      campaign_finance:
        'https://www.ncsbe.gov/campaign-finance/search-campaign-funding-and-spending-reports-and-penalties',
      lobbying: 'https://www.ncsbe.gov/results-data',
      newsroom: 'https://governor.nc.gov/news/press-releases',
      news_rss: 'https://governor.nc.gov/news/feed',
    },
    leader_match: leaderMatch('Stein'),
    disclosure_strategy: 'nc_sei_portal',
    salary_strategy: 'nc_statutory_manual',
    campaign_strategy: 'nc_sbe_cf',
    lobbying_strategy: 'nc_sbe_portal',
    news_strategy: 'rss',
    cabinet_strategy: 'html_js_heavy',
    blocked_notes: [
      'ethics.nc.gov unreachable; ncleg.gov financial disclosure returns HTTP 403.',
      'Governor cabinet page not at expected URL; site is client-rendered.',
    ],
  },
  'US-NJ': {
    ...leaderFromOverlay('US-NJ'),
    regulatory_act: 'New Jersey Conflicts of Interest Law — financial disclosure',
    regulatory_body: 'New Jersey State Ethics Commission',
    sources: {
      governor: 'https://www.nj.gov/governor/',
      cabinet: 'https://www.nj.gov/governor/admin/cabinet/',
      ethics: 'https://www.nj.gov/ethics/',
      elections: 'https://www.nj.gov/state/elections/',
      lobbying: 'https://www.njelec.com/lobbying/',
      newsroom: 'https://www.nj.gov/governor/',
    },
    leader_match: leaderMatch('Sherrill'),
    disclosure_strategy: 'nj_ethics_portal',
    salary_strategy: 'nj_statutory_manual',
    campaign_strategy: 'nj_elections_portal',
    lobbying_strategy: 'nj_lobby_portal',
    news_strategy: 'nj_gov_news',
    cabinet_strategy: 'html_cabinet',
    blocked_notes: [
      'nj.gov/state/elections portal returns minimal shell from automated fetch.',
      'Campaign finance search requires interactive NJ Election Law Enforcement Commission portal.',
    ],
  },
  'US-VA': {
    ...leaderFromOverlay('US-VA'),
    regulatory_act: 'Virginia Conflict of Interest Act — Statement of Economic Interests',
    regulatory_body: 'Virginia Conflict of Interest and Ethics Advisory Council',
    sources: {
      governor: 'https://www.governor.virginia.gov/',
      cabinet: 'https://www.governor.virginia.gov/',
      ethics: 'https://ethics.dls.virginia.gov/',
      elections: 'https://www.elections.virginia.gov/candidatepac-info/',
      lobbying: 'https://ethics.dls.virginia.gov/',
      newsroom: 'https://www.governor.virginia.gov/newsroom/news-releases',
    },
    leader_match: leaderMatch('Spanberger'),
    disclosure_strategy: 'va_ethics_portal',
    salary_strategy: 'va_statutory_manual',
    campaign_strategy: 'va_elections_portal',
    lobbying_strategy: 'va_ethics_portal',
    news_strategy: 'va_news_releases',
    cabinet_strategy: 'html_js_heavy',
    blocked_notes: [
      'Governor secretariats/agencies URL not machine-located; leadership roster requires manual review.',
    ],
  },
  'US-WA': {
    ...leaderFromOverlay('US-WA'),
    regulatory_act: 'Washington Public Disclosure Act — Personal Financial Affairs Disclosure (F-1)',
    regulatory_body: 'Washington State Public Disclosure Commission (PDC)',
    sources: {
      governor: 'https://www.governor.wa.gov/',
      cabinet: 'https://www.governor.wa.gov/',
      ethics: 'https://www.pdc.wa.gov/registration-reporting/personal-financial-affairs-disclosure',
      ethics_portal: 'https://www.pdc.wa.gov/political-disclosure-reporting-data',
      campaign_finance: 'https://www.pdc.wa.gov/political-disclosure-reporting-data',
      lobbying: 'https://www.pdc.wa.gov/lobbyists',
      elections: 'https://www.sos.wa.gov/elections/',
      newsroom: 'https://www.governor.wa.gov/news/news-releases',
    },
    leader_match: leaderMatch('Ferguson'),
    disclosure_strategy: 'wa_pdc_portal',
    salary_strategy: 'wa_statutory_manual',
    campaign_strategy: 'wa_pdc_portal',
    lobbying_strategy: 'wa_pdc_lobby',
    news_strategy: 'wa_news_releases',
    cabinet_strategy: 'html_js_heavy',
    blocked_notes: [
      'PDC browse/search interfaces are client-rendered; individual F-1 rows require manual portal search.',
      'Governor organizational chart URL not found at expected path.',
    ],
  },
  'US-AZ': {
    ...leaderFromOverlay('US-AZ'),
    regulatory_act: 'Arizona financial disclosure laws — Statement of Financial Interests',
    regulatory_body: 'Arizona Secretary of State / ethics programs',
    sources: {
      governor: 'https://azgovernor.gov/',
      cabinet: 'https://azgovernor.gov/governor/meet-governor',
      ethics: 'https://azsos.gov/elections/campaign-finance',
      lobbying: 'https://azsos.gov/elections/lobbyist/',
      newsroom: 'https://azgovernor.gov/news',
    },
    leader_match: leaderMatch('Hobbs'),
    disclosure_strategy: 'az_blocked',
    salary_strategy: 'az_statutory_manual',
    campaign_strategy: 'az_sos_portal',
    lobbying_strategy: 'az_sos_lobby',
    news_strategy: 'html_newsroom',
    cabinet_strategy: 'source_blocked',
    blocked_notes: [
      'azgovernor.gov and azsos.gov return HTTP 403 to automated fetch — manual browser review required.',
    ],
  },
  'US-MA': {
    ...leaderFromOverlay('US-MA'),
    regulatory_act: 'Massachusetts Financial Disclosure Law (G.L. c. 268B)',
    regulatory_body: 'Massachusetts State Ethics Commission',
    sources: {
      governor: 'https://www.mass.gov/orgs/office-of-the-governor',
      cabinet: 'https://www.mass.gov/orgs/office-of-the-governor/executive-staff',
      ethics: 'https://www.mass.gov/orgs/state-ethics-commission',
      elections: 'https://www.sec.state.ma.us/divisions/cis/cisidx.htm',
      lobbying: 'https://www.sec.state.ma.us/LobbyingPublic/LobbyingPublic.htm',
      newsroom: 'https://www.mass.gov/orgs/office-of-the-governor',
    },
    leader_match: leaderMatch('Healey'),
    disclosure_strategy: 'ma_ethics_portal',
    salary_strategy: 'ma_statutory_manual',
    campaign_strategy: 'ma_sec_state',
    lobbying_strategy: 'ma_lobby_portal',
    news_strategy: 'mass_gov_news',
    cabinet_strategy: 'html_js_heavy',
    blocked_notes: [
      'mass.gov and sec.state.ma.us pages are client-rendered or return redirect shells to automated fetch.',
    ],
  },
  'US-TN': {
    ...leaderFromOverlay('US-TN'),
    regulatory_act: 'Tennessee Title 8 — Statement of Disclosure of Interests',
    regulatory_body: 'Tennessee Registry of Election Finance / Secretary of State',
    sources: {
      governor: 'https://www.tn.gov/governor/',
      cabinet: 'https://www.tn.gov/governor/about-the-governor/commissioners.html',
      ethics: 'https://sos.tn.gov/',
      campaign_finance: 'https://sos.tn.gov/elections',
      lobbying: 'https://sos.tn.gov/lobbying',
      newsroom: 'https://www.tn.gov/governor/news.html',
    },
    leader_match: leaderMatch('Lee'),
    disclosure_strategy: 'tn_disclosure_portal',
    salary_strategy: 'tn_statutory_manual',
    campaign_strategy: 'tn_sos_portal',
    lobbying_strategy: 'tn_sos_lobby',
    news_strategy: 'tn_gov_news',
    cabinet_strategy: 'html_js_heavy',
    blocked_notes: [
      'TN SOS campaign finance and lobbying URLs not machine-located at expected paths.',
      'Governor commissioners page intermittently unreachable from automated fetch.',
    ],
  },
});

const US_STATE_ABBRS = Object.freeze([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY',
  'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
  'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]);

const ALL_US_STATE_IDS = Object.freeze(US_STATE_ABBRS.map((a) => `US-${a}`));

/** @param {string} id */
function getStateConfig(id) {
  if (PILOT[id]) return { ...PILOT[id], jurisdictionId: id };
  if (!ALL_US_STATE_IDS.includes(id) || id === 'US-CA') return null;
  const base = leaderFromOverlay(id);
  return {
    ...base,
    jurisdictionId: id,
    regulatory_body: 'State ethics / financial disclosure authority',
    sources: {
      governor: base.governorPage,
      newsroom: base.governorPage,
    },
    leader_match: leaderMatch(base.leaderLast),
    disclosure_strategy: 'pending_batch',
    blocked_notes: ['Official source mapping pending batch sync — not configured for automated fetch yet.'],
  };
}

module.exports = {
  PHASE1_IDS,
  BATCH2_IDS,
  CONFIGURED_US_STATE_IDS,
  ALL_US_STATE_IDS,
  PILOT,
  getStateConfig,
  leaderFromOverlay,
};
