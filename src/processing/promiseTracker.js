/**
 * Promise Tracker
 *
 * Tracks public promises made by PMs and Presidents, monitors delivery status,
 * calculates a Promise Score per leader (0–100), and persists findings to
 * Firestore collection "promise_tracker".
 *
 * Each promise record includes:
 *   originalQuote   — verbatim words used when the promise was made
 *   sourceUrl       — direct URL to the primary source
 *   measurableTarget — concrete, verifiable goal (null if qualitative)
 *   deliveredPercent — 0–100 current progress
 */

import { db } from '../firebase.js';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';

// ─── Status constants ─────────────────────────────────────────────────────────

export const STATUS = {
  KEPT: 'Kept',
  BROKEN: 'Broken',
  IN_PROGRESS: 'In Progress',
  NOT_STARTED: 'Not Started',
  PARTIALLY_KEPT: 'Partially Kept',
};

// Points awarded per status when calculating Promise Score
const STATUS_POINTS = {
  [STATUS.KEPT]: 100,
  [STATUS.PARTIALLY_KEPT]: null, // uses deliveredPercent
  [STATUS.IN_PROGRESS]: 25,
  [STATUS.NOT_STARTED]: 0,
  [STATUS.BROKEN]: 0,
};

// ─── Promise dataset ──────────────────────────────────────────────────────────
// Sources: official platforms, Hansard, press releases, campaign speeches.
// Statuses and progress figures reflect the state of play as of March 2026.

export const PROMISES = [

  // ══════════════════════════════════════════════════════════════════════════
  // MARK CARNEY — Canada
  // ══════════════════════════════════════════════════════════════════════════

  // ── Original 5 ────────────────────────────────────────────────────────────
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    category: 'housing',
    promise: 'Build 500,000 new homes per year by 2029 through the Canada Housing Action Plan.',
    originalQuote: 'We will build 500,000 homes a year — starting now.',
    dateMade: '2025-03-14',
    source: 'Liberal Party election platform 2025',
    sourceUrl: 'https://liberal.ca/liberal-platform/',
    measurableTarget: '500,000 housing starts per year by 2029',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 18,
    evidence: 'Housing starts for 2025 reached ~91,000 units — below the 500,000 annual pace required. New federal incentives are in place but delivery timelines lag.',
    lastChecked: '2026-03-01',
    targetDate: '2029-12-31',
  },
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    category: 'economy',
    promise: 'Cut the lowest federal income tax bracket from 15% to 14%, saving middle-class families up to $900 per year.',
    originalQuote: 'We will cut the middle-class tax rate from 15% to 14% — the largest tax cut for working Canadians in 20 years.',
    dateMade: '2025-03-14',
    source: 'Liberal Party election platform 2025',
    sourceUrl: 'https://liberal.ca/liberal-platform/',
    measurableTarget: 'Lowest tax bracket reduced to 14% by July 2026',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 40,
    evidence: 'Legislation introduced in the Fall 2025 fiscal update. Parliamentary debate ongoing; not yet enacted.',
    lastChecked: '2026-03-01',
    targetDate: '2026-07-01',
  },
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    category: 'climate',
    promise: 'Eliminate the consumer carbon price (carbon tax) immediately upon taking office.',
    originalQuote: 'I will eliminate the consumer carbon tax on day one.',
    dateMade: '2025-03-14',
    source: 'Liberal Party election platform 2025 / CBC News interview',
    sourceUrl: 'https://www.cbc.ca/news/politics/carney-carbon-tax-1.7452801',
    measurableTarget: 'Consumer carbon levy at $0 by April 1, 2025',
    status: STATUS.KEPT,
    deliveredPercent: 100,
    evidence: 'The consumer carbon levy was eliminated on April 1, 2025, as promised. Industrial pricing retained.',
    lastChecked: '2026-03-01',
    targetDate: '2025-04-01',
  },
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    category: 'economy',
    promise: 'Impose matching counter-tariffs and negotiate a new Canada-US trade framework to end the 25% US tariffs.',
    originalQuote: 'Canada will respond dollar for dollar to US tariffs and fight back for Canadian workers.',
    dateMade: '2025-03-14',
    source: 'G7 press conference, March 2025',
    sourceUrl: 'https://pm.gc.ca/en/news/speeches/2025/03/14/prime-minister-carney-delivers-remarks-us-trade',
    measurableTarget: 'US tariffs on Canada reduced to zero; new trade framework by end of 2026',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 35,
    evidence: 'Canada imposed retaliatory tariffs on ~$30B of US goods. Formal trade negotiations opened but no framework deal reached as of March 2026.',
    lastChecked: '2026-03-01',
    targetDate: '2026-12-31',
  },
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    category: 'healthcare',
    promise: 'Expand the National Pharmacare program to cover all Canadians for diabetes and contraception medications.',
    originalQuote: 'Every Canadian — no matter where they live — will have access to the drugs they need.',
    dateMade: '2025-03-14',
    source: 'Liberal-NDP supply-and-confidence agreement / election platform',
    sourceUrl: 'https://www.canada.ca/en/health-canada/services/health-care-system/pharmacare/about.html',
    measurableTarget: 'All 13 provinces and territories signed bilateral agreements by December 2026',
    status: STATUS.PARTIALLY_KEPT,
    deliveredPercent: 60,
    evidence: 'Pharmacare Act covers diabetes drugs and contraception in eight provinces. Three provinces (Alberta, New Brunswick, PEI) have not yet signed bilateral agreements.',
    lastChecked: '2026-03-01',
    targetDate: '2026-12-31',
  },

  // ── 10 New Carney promises ─────────────────────────────────────────────────
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    category: 'economy',
    promise: 'Attract $250 billion in private investment in clean industries over the next decade to build a competitive Canadian economy.',
    originalQuote: 'We will build the most dynamic economy in the G7 by attracting $250 billion in new clean investment.',
    dateMade: '2025-03-14',
    source: 'Liberal Party election platform 2025',
    sourceUrl: 'https://liberal.ca/liberal-platform/',
    measurableTarget: '$250B in private clean investment by 2035',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 8,
    evidence: 'Canada Growth Fund deployed $6B of its $15B mandate by Q1 2026. Investment attraction framework launched but pace lags the decade target.',
    lastChecked: '2026-03-01',
    targetDate: '2035-12-31',
  },
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    category: 'healthcare',
    promise: 'Train and hire 1,000 new family doctors and nurse practitioners to close the primary care gap.',
    originalQuote: 'We will make sure every Canadian has access to a family doctor by training 1,000 new primary care providers.',
    dateMade: '2025-03-14',
    source: 'Liberal Party election platform 2025',
    sourceUrl: 'https://liberal.ca/liberal-platform/',
    measurableTarget: '1,000 new primary care providers licensed and practising by 2027',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 14,
    evidence: 'Federal funding for 140 new residency positions announced in Budget 2025. Medical schools ramping up enrolment. 5.5M Canadians still without a family doctor.',
    lastChecked: '2026-03-01',
    targetDate: '2027-12-31',
  },
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    category: 'housing',
    promise: 'Introduce a federal renters\' bill of rights to end renovictions, ban rent-to-own loopholes, and cap rent increases.',
    originalQuote: 'We will crack down on renovictions, protect renters from unfair evictions, and make the rental market work for Canadians.',
    dateMade: '2025-03-14',
    source: 'Liberal Party election platform 2025',
    sourceUrl: 'https://liberal.ca/liberal-platform/',
    measurableTarget: 'Renters Bill of Rights enacted by December 2026',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 40,
    evidence: 'Bill C-56 tabled in Parliament October 2025 with renter protection provisions. Second reading passed; Committee hearings underway as of March 2026.',
    lastChecked: '2026-03-01',
    targetDate: '2026-12-31',
  },
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    category: 'immigration',
    promise: 'Reduce the temporary resident population from 7.5% to 5% of Canada\'s population by 2027 by tightening study permits and work visas.',
    originalQuote: 'Canada\'s immigration system must be orderly, compassionate, and in the national interest. We will restore balance.',
    dateMade: '2025-03-14',
    source: 'Liberal Party election platform 2025',
    sourceUrl: 'https://liberal.ca/liberal-platform/',
    measurableTarget: 'Temporary residents ≤5% of population (approx. 2M people) by 2027',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 32,
    evidence: 'Study permit cap reduced to 437,000 for 2025. Post-graduation work permits tightened. Temporary resident share fell from 7.5% to ~6.9% by Q4 2025.',
    lastChecked: '2026-03-01',
    targetDate: '2027-12-31',
  },
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    category: 'climate',
    promise: 'Achieve a 90% clean, non-emitting national electricity grid by 2035 through the Clean Electricity Regulations.',
    originalQuote: 'Canada will have a clean grid by 2035 — this is both a climate commitment and an economic opportunity.',
    dateMade: '2025-03-14',
    source: 'Liberal Party election platform 2025',
    sourceUrl: 'https://liberal.ca/liberal-platform/',
    measurableTarget: '90% of national electricity from non-emitting sources by 2035',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 44,
    evidence: 'Canada currently generates ~83% of electricity from non-emitting sources. Clean Electricity Regulations finalised August 2025. On track for major provinces; Alberta and Saskatchewan challenging regulations in court.',
    lastChecked: '2026-03-01',
    targetDate: '2035-12-31',
  },
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    category: 'education',
    promise: 'Make post-secondary more affordable by eliminating interest on Canada Student Loans and expanding grants for low-income students.',
    originalQuote: 'No student should graduate into debt they can\'t manage. We will make post-secondary education truly affordable.',
    dateMade: '2025-03-14',
    source: 'Liberal Party election platform 2025',
    sourceUrl: 'https://liberal.ca/liberal-platform/',
    measurableTarget: 'Zero interest on Canada Student Loans maintained; Canada Student Grants increased 40%',
    status: STATUS.KEPT,
    deliveredPercent: 100,
    evidence: 'Interest-free Canada Student Loans maintained from 2023. Canada Student Grants increased by 40% in Budget 2024 and preserved in Budget 2025. Promise fulfilled.',
    lastChecked: '2026-03-01',
    targetDate: '2025-12-31',
  },
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    category: 'defence',
    promise: 'Increase Canadian defence spending to 2% of GDP by 2032 to fulfil Canada\'s NATO commitment.',
    originalQuote: 'Canada will meet its NATO obligations. We will get to 2% — not in a decade, but by 2032.',
    dateMade: '2025-03-14',
    source: 'Liberal Party election platform 2025 / NATO summit communiqué',
    sourceUrl: 'https://pm.gc.ca/en/news/speeches/2025/06/24/prime-minister-carney-delivers-remarks-nato-summit',
    measurableTarget: '2.0% of GDP on national defence by 2032',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 38,
    evidence: 'Canada\'s defence spending reached 1.76% of GDP in 2025, up from 1.37% in 2023. Budget 2025 allocated $14B in new defence spending over five years. Trajectory toward 2% by 2032 is credible.',
    lastChecked: '2026-03-01',
    targetDate: '2032-12-31',
  },
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    category: 'crime',
    promise: 'Launch a national strategy to combat auto theft, gang violence, and online financial crime, including mandatory minimum sentences for repeat offenders.',
    originalQuote: 'We will crack down on the auto theft epidemic and the gang networks profiting from it.',
    dateMade: '2025-03-14',
    source: 'Liberal Party election platform 2025',
    sourceUrl: 'https://liberal.ca/liberal-platform/',
    measurableTarget: '50% reduction in auto theft by 2028; gang violence charges up 30%',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 22,
    evidence: 'Auto Theft Summit held April 2025. Bill C-26 (auto theft penalties) received Royal Assent September 2025. Auto thefts down 11% nationally in H2 2025 vs H2 2024.',
    lastChecked: '2026-03-01',
    targetDate: '2028-12-31',
  },
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    category: 'tax',
    promise: 'Introduce a windfall profits tax on major grocery chains to fight food inflation and fund affordability measures.',
    originalQuote: 'Grocery store CEOs have made record profits while Canadians struggle to afford food. We will act.',
    dateMade: '2025-03-14',
    source: 'Liberal Party election platform 2025',
    sourceUrl: 'https://liberal.ca/liberal-platform/',
    measurableTarget: 'Grocery windfall profits tax legislation enacted by mid-2026; Grocery Code of Conduct signed',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 20,
    evidence: 'Grocery Code of Conduct signed by major chains October 2025. Windfall tax consultation paper released November 2025; legislation not yet tabled.',
    lastChecked: '2026-03-01',
    targetDate: '2026-06-30',
  },
  {
    leaderId: 'carney',
    leaderName: 'Mark Carney',
    country: 'CA',
    role: 'Prime Minister',
    category: 'infrastructure',
    promise: 'Invest $100 billion in Canadian infrastructure over ten years through the reformed Canada Infrastructure Bank, prioritising trade corridors and transit.',
    originalQuote: 'We will rebuild Canada\'s infrastructure to move goods faster, connect communities, and compete with the world.',
    dateMade: '2025-03-14',
    source: 'Liberal Party election platform 2025',
    sourceUrl: 'https://liberal.ca/liberal-platform/',
    measurableTarget: '$100B infrastructure deployed by 2035; 5 major trade corridor projects under construction by 2027',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 9,
    evidence: 'Canada Infrastructure Bank mandate reformed and recapitalised with $15B in Budget 2025. Three trade corridor feasibility studies launched. Full $100B deployment is a long-term commitment.',
    lastChecked: '2026-03-01',
    targetDate: '2035-12-31',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // DONALD TRUMP — United States
  // ══════════════════════════════════════════════════════════════════════════

  // ── Original 5 ────────────────────────────────────────────────────────────
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    category: 'economy',
    promise: 'Impose 25% tariffs on all imports from Canada and Mexico on day one to protect American workers.',
    originalQuote: 'On January 20th, as one of my many first executive orders, I will sign all necessary documents to charge Mexico and Canada a 25% tariff on all products coming into the United States.',
    dateMade: '2024-11-25',
    source: 'Truth Social post, November 2024',
    sourceUrl: 'https://truthsocial.com/@realDonaldTrump/posts/113546084273246410',
    measurableTarget: '25% tariffs on Canadian and Mexican goods in effect by January 20, 2025',
    status: STATUS.KEPT,
    deliveredPercent: 100,
    evidence: 'Executive order signed January 20, 2025 imposing 25% tariffs on Canadian and Mexican goods (10% on Canadian energy). Tariffs took effect February 4, 2025.',
    lastChecked: '2026-03-01',
    targetDate: '2025-01-20',
  },
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    category: 'immigration',
    promise: 'Carry out the largest deportation operation in American history, removing millions of undocumented immigrants.',
    originalQuote: 'We will carry out the largest deportation operation in American history.',
    dateMade: '2024-08-22',
    source: 'Republican National Convention acceptance speech, August 2024',
    sourceUrl: 'https://www.rev.com/blog/transcripts/donald-trump-rnc-2024-speech-transcript',
    measurableTarget: 'Millions of undocumented immigrants deported; border crossings at historic lows',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 22,
    evidence: 'ICE deportations rose to ~137,000 in FY2025 Q1-Q2, above the prior-year pace but far below the claimed millions. Legal challenges have slowed operations.',
    lastChecked: '2026-03-01',
    targetDate: '2028-01-20',
  },
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    category: 'tax',
    promise: 'Make the 2017 Tax Cuts and Jobs Act permanent and add new tax relief for tips and overtime pay.',
    originalQuote: 'We\'re going to make the Trump tax cuts permanent. And we\'re going to have no tax on tips — no tax on overtime.',
    dateMade: '2024-10-15',
    source: 'Campaign economic policy speech, Detroit, October 2024',
    sourceUrl: 'https://www.rev.com/blog/transcripts/trump-economic-speech-detroit-october-2024',
    measurableTarget: 'TCJA extended permanently; tax-free tips and overtime in law by end of 2025',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 30,
    evidence: 'The "One Big Beautiful Bill" passed the House in March 2026 and is under Senate debate. No-tax-on-tips executive guidance issued but no enacted legislation yet.',
    lastChecked: '2026-03-01',
    targetDate: '2026-12-31',
  },
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    category: 'defence',
    promise: 'End the war in Ukraine within 24 hours of taking office.',
    originalQuote: 'I will have the war in Ukraine settled within 24 hours — before I even take office.',
    dateMade: '2024-06-13',
    source: 'Fox News interview, June 2024',
    sourceUrl: 'https://www.foxnews.com/video/6355171036112',
    measurableTarget: 'Russia-Ukraine ceasefire/peace deal by January 21, 2025',
    status: STATUS.BROKEN,
    deliveredPercent: 0,
    evidence: 'The Russia-Ukraine war continues as of March 2026, 14 months into the Trump presidency. Ceasefire talks have stalled; no peace agreement reached.',
    lastChecked: '2026-03-01',
    targetDate: '2025-01-21',
  },
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    category: 'climate',
    promise: 'Dramatically expand US oil, gas, and coal production — "Drill, baby, drill" — and achieve energy dominance.',
    originalQuote: 'We will drill, baby, drill. We will have more liquid gold under our feet than any other nation on Earth.',
    dateMade: '2024-07-18',
    source: 'RNC acceptance speech, July 2024',
    sourceUrl: 'https://www.rev.com/blog/transcripts/trump-rnc-2024-acceptance-speech-transcript',
    measurableTarget: 'US oil output to 15M bbl/day; all Biden energy restrictions lifted',
    status: STATUS.KEPT,
    deliveredPercent: 100,
    evidence: 'Declared national energy emergency on day one. Withdrew from the Paris Agreement. Opened federal lands and offshore areas to new drilling leases. US oil production reached record 13.6M bbl/day in Q4 2025.',
    lastChecked: '2026-03-01',
    targetDate: '2025-12-31',
  },

  // ── 10 New Trump promises ──────────────────────────────────────────────────
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    category: 'economy',
    promise: 'Bring back American manufacturing and create 10 million new jobs in four years through tariffs and deregulation.',
    originalQuote: 'We will create 10 million jobs in the first four years. We are going to bring our factories back to this country.',
    dateMade: '2024-07-18',
    source: 'RNC acceptance speech, July 2024',
    sourceUrl: 'https://www.rev.com/blog/transcripts/trump-rnc-2024-acceptance-speech-transcript',
    measurableTarget: '10 million net new jobs by January 2029',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 16,
    evidence: 'US economy added ~1.6M jobs in 2025 at a pace slower than Biden-era. Manufacturing jobs increased by 180,000 in FY2025 but tariff-induced supply chain disruptions are dampening broader gains.',
    lastChecked: '2026-03-01',
    targetDate: '2029-01-20',
  },
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    category: 'healthcare',
    promise: 'Bring down prescription drug prices by 50–80% through executive action and international reference pricing.',
    originalQuote: 'Drug prices will come down 50, 60, 70, 80 percent — immediately, within the first week.',
    dateMade: '2024-09-10',
    source: 'Presidential debate, September 2024',
    sourceUrl: 'https://www.rev.com/blog/transcripts/trump-harris-presidential-debate-transcript-2024',
    measurableTarget: 'Average prescription drug prices down 50% by end of 2025',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 8,
    evidence: 'Most Favoured Nation drug pricing executive order signed March 2025. Pharmaceutical industry filed legal challenge; implementation delayed. Average drug prices down ~4% so far.',
    lastChecked: '2026-03-01',
    targetDate: '2025-12-31',
  },
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    category: 'housing',
    promise: 'Open up federal lands for housing construction to dramatically increase supply and make home ownership affordable.',
    originalQuote: 'We\'re going to open up large parcels of federal land for housing. We\'re going to get housing affordable.',
    dateMade: '2024-10-15',
    source: 'Campaign economic speech, Detroit, October 2024',
    sourceUrl: 'https://www.rev.com/blog/transcripts/trump-economic-speech-detroit-october-2024',
    measurableTarget: '1 million new homes built on federal/public land by 2028',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 5,
    evidence: 'Executive order directing Interior Department to identify federal lands suitable for housing signed March 2025. Land inventory ongoing; no housing construction started as of March 2026.',
    lastChecked: '2026-03-01',
    targetDate: '2028-01-20',
  },
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    category: 'immigration',
    promise: 'Complete the border wall and end illegal immigration once and for all.',
    originalQuote: 'We will seal the border, stop the invasion, and deport millions of criminal aliens back to the countries where they came from.',
    dateMade: '2024-08-22',
    source: 'RNC acceptance speech, July 2024',
    sourceUrl: 'https://www.rev.com/blog/transcripts/trump-rnc-2024-acceptance-speech-transcript',
    measurableTarget: 'Physical border wall complete; southern border crossings at near-zero',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 28,
    evidence: 'Border crossings dropped sharply — February 2025 saw the lowest monthly total in 25 years at 8,200. Wall construction restarted in 200+ mile sections. Asylum effectively ended by executive order.',
    lastChecked: '2026-03-01',
    targetDate: '2028-01-20',
  },
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    category: 'education',
    promise: 'Close the Department of Education and return full control of education to the states.',
    originalQuote: 'I will close the Department of Education and send education back to the states where it belongs.',
    dateMade: '2024-09-10',
    source: 'Presidential debate, September 2024',
    sourceUrl: 'https://www.rev.com/blog/transcripts/trump-harris-presidential-debate-transcript-2024',
    measurableTarget: 'Department of Education abolished; functions transferred to states by 2027',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 30,
    evidence: 'Executive order directing DOGE to restructure the Department of Education signed February 2025. ~2,000 staff reductions by March 2026. Full abolition requires an Act of Congress; bill introduced but stalled.',
    lastChecked: '2026-03-01',
    targetDate: '2027-01-20',
  },
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    category: 'defence',
    promise: 'Demand all NATO allies immediately commit to spending at least 5% of GDP on defence.',
    originalQuote: 'I told one of the heads of a big country: if you don\'t pay, I would encourage Russia to do whatever the hell they want. And I mean it. You have to pay. Five percent.',
    dateMade: '2024-02-10',
    source: 'Campaign rally, Conway, South Carolina, February 2024',
    sourceUrl: 'https://www.rev.com/blog/transcripts/trump-conway-south-carolina-rally-speech-transcript-2024',
    measurableTarget: 'All 32 NATO allies at 5% of GDP defence spending',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 5,
    evidence: 'Only Poland exceeds 4% of GDP on defence (4.1%). No NATO ally has committed to 5%. The 2025 Hague summit set 3.5% as a new target; 5% remains unachieved.',
    lastChecked: '2026-03-01',
    targetDate: '2028-01-20',
  },
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    category: 'crime',
    promise: 'Restore law and order with a hardline crime agenda including the death penalty for drug dealers and human traffickers.',
    originalQuote: 'If you sell drugs and you\'re a drug dealer and you get caught, you should get the death penalty.',
    dateMade: '2024-08-22',
    source: 'Campaign rally, August 2024',
    sourceUrl: 'https://www.whitehouse.gov/presidential-actions/',
    measurableTarget: 'Federal death penalty for drug trafficking enacted; violent crime rates fall 20%',
    status: STATUS.NOT_STARTED,
    deliveredPercent: 0,
    evidence: 'No federal legislation on death penalty for drug dealers introduced as of March 2026. Executive order on crime signed January 2025 focused on federal prosecution priorities. Congressional action not yet attempted.',
    lastChecked: '2026-03-01',
    targetDate: '2028-01-20',
  },
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    category: 'tax',
    promise: 'Eliminate federal income taxes on Social Security benefits for all American seniors.',
    originalQuote: 'Seniors should not pay taxes on their Social Security. They have paid into it their whole lives.',
    dateMade: '2024-07-31',
    source: 'Truth Social / campaign rally, July 2024',
    sourceUrl: 'https://truthsocial.com/@realDonaldTrump',
    measurableTarget: 'Social Security benefits exempt from federal income tax for all recipients',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 20,
    evidence: 'Included in the "One Big Beautiful Bill" passed the House March 2026. Senate consideration pending. Not yet law. Estimated 10-year cost: $1.8T.',
    lastChecked: '2026-03-01',
    targetDate: '2026-12-31',
  },
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    category: 'infrastructure',
    promise: 'Deliver the most ambitious infrastructure rebuild in American history through a public-private investment surge.',
    originalQuote: 'We\'re going to have the greatest infrastructure the world has ever seen. Roads, bridges, airports — all of them rebuilt.',
    dateMade: '2024-07-18',
    source: 'RNC acceptance speech, July 2024',
    sourceUrl: 'https://www.rev.com/blog/transcripts/trump-rnc-2024-acceptance-speech-transcript',
    measurableTarget: 'Permitting reform enacted; $500B in infrastructure investment committed',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 15,
    evidence: 'NEPA permitting reform executive order signed February 2025, cutting environmental review timelines. DOGE reviewed infrastructure contracts worth $120B. No major new funding bill enacted.',
    lastChecked: '2026-03-01',
    targetDate: '2028-01-20',
  },
  {
    leaderId: 'trump',
    leaderName: 'Donald Trump',
    country: 'US',
    role: 'President',
    category: 'economy',
    promise: 'Cut federal spending by $2 trillion through the DOGE efficiency commission to eliminate waste, fraud, and abuse.',
    originalQuote: 'We\'re going to create a Department of Government Efficiency. Elon and Vivek are going to work to dismantle government bureaucracy.',
    dateMade: '2024-11-12',
    source: 'Announcement of DOGE, November 2024',
    sourceUrl: 'https://www.whitehouse.gov/presidential-actions/2025/01/establishing-and-implementing-the-presidents-department-of-government-efficiency/',
    measurableTarget: '$2 trillion in federal spending cuts by end of first term',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 10,
    evidence: 'DOGE claimed ~$200B in identified savings as of March 2026, though independent analysts dispute many figures. Multiple reductions in federal workforce (~120,000 jobs cut). Long way from $2T target.',
    lastChecked: '2026-03-01',
    targetDate: '2028-01-20',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ANTHONY ALBANESE — Australia
  // ══════════════════════════════════════════════════════════════════════════

  // ── Original 5 ────────────────────────────────────────────────────────────
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    category: 'housing',
    promise: 'Build 1.2 million new homes over five years (2024–2029) via the National Housing Accord.',
    originalQuote: 'We have set an ambitious but achievable target — 1.2 million new, well-located homes over five years.',
    dateMade: '2023-08-01',
    source: 'National Cabinet statement, August 2023',
    sourceUrl: 'https://www.pm.gov.au/media/national-cabinet-statement-better-deal-renters-and-addressing-housing-crisis',
    measurableTarget: '1.2 million homes completed 2024–2029',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 25,
    evidence: 'Around 300,000 homes completed of the 1.2M target by early 2026. Annual completions tracking at ~170,000 versus the 240,000 pace required.',
    lastChecked: '2026-03-01',
    targetDate: '2029-12-31',
  },
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    category: 'economy',
    promise: 'Cut household electricity bills by $275 per year by 2025 compared to 2022 baselines.',
    originalQuote: 'Our modelling shows our energy policies will reduce electricity bills by $275 by 2025.',
    dateMade: '2022-05-01',
    source: 'ALP 2022 election platform',
    sourceUrl: 'https://www.alp.org.au/policies/powering-australia/',
    measurableTarget: 'Average household electricity bills $275/year lower than 2022 by December 2025',
    status: STATUS.BROKEN,
    deliveredPercent: 0,
    evidence: 'Average household electricity bills rose by approximately $400/year between 2022 and 2025, the opposite of the promised reduction. Government cited global energy market pressures.',
    lastChecked: '2026-03-01',
    targetDate: '2025-12-31',
  },
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    category: 'crime',
    promise: 'Establish an independent National Anti-Corruption Commission (NACC) within the first term.',
    originalQuote: 'Labor will establish a powerful, transparent National Anti-Corruption Commission.',
    dateMade: '2022-05-01',
    source: 'ALP 2022 election platform',
    sourceUrl: 'https://www.alp.org.au/policies/national-anti-corruption-commission/',
    measurableTarget: 'NACC operational with full investigative powers within first term (by May 2025)',
    status: STATUS.KEPT,
    deliveredPercent: 100,
    evidence: 'The NACC commenced operations on July 1, 2023, within the promised first term, with the power to investigate federal politicians and public servants.',
    lastChecked: '2026-03-01',
    targetDate: '2025-05-31',
  },
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    category: 'healthcare',
    promise: 'Deliver a 15% pay rise for aged care workers to address sector workforce shortages.',
    originalQuote: 'If you elect a Labor government, Labor will fund aged care workers to receive a pay rise of at least 15%.',
    dateMade: '2022-05-01',
    source: 'ALP 2022 election platform',
    sourceUrl: 'https://www.alp.org.au/policies/aged-care/',
    measurableTarget: '15% wage increase for aged care workers from July 2023',
    status: STATUS.KEPT,
    deliveredPercent: 100,
    evidence: 'The Fair Work Commission awarded a 15% pay increase for aged care workers effective July 2023, funded by the federal government as promised.',
    lastChecked: '2026-03-01',
    targetDate: '2023-07-01',
  },
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    category: 'economy',
    promise: 'Expand childcare subsidies so no family pays more than 10% of their income on childcare.',
    originalQuote: 'Labor will make childcare more affordable and boost women\'s workforce participation.',
    dateMade: '2022-05-01',
    source: 'ALP 2022 election platform',
    sourceUrl: 'https://www.alp.org.au/policies/childcare/',
    measurableTarget: 'Childcare costs capped at 10% of family income for all families',
    status: STATUS.PARTIALLY_KEPT,
    deliveredPercent: 70,
    evidence: 'Childcare subsidy rate increased from 85% to 90% for most families from July 2023. Around 1.2 million families benefited but the 10%-of-income cap for all families has not been legislated.',
    lastChecked: '2026-03-01',
    targetDate: '2025-12-31',
  },

  // ── 10 New Albanese promises ───────────────────────────────────────────────
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    category: 'economy',
    promise: 'Deliver real wages growth above inflation throughout the Parliament so workers are better off.',
    originalQuote: 'Under Labor, workers\' wages will grow in real terms. Australians will be better off under Labor.',
    dateMade: '2022-05-01',
    source: 'ALP 2022 election platform',
    sourceUrl: 'https://www.alp.org.au/policies/economy/',
    measurableTarget: 'Wage Price Index growth exceeds CPI in every quarter from mid-2023',
    status: STATUS.PARTIALLY_KEPT,
    deliveredPercent: 65,
    evidence: 'Real wages turned positive in Q3 2023 and have grown in most subsequent quarters. WPI rose 3.2% vs CPI 2.8% in Q4 2025. Some lower-paid sectors still not keeping pace.',
    lastChecked: '2026-03-01',
    targetDate: '2025-05-31',
  },
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    category: 'healthcare',
    promise: 'Triple the Medicare bulk billing incentive for GPs to ensure every Australian can see a doctor for free.',
    originalQuote: 'We will triple the bulk billing incentive to make sure you can see a GP for free, wherever you live.',
    dateMade: '2023-05-09',
    source: 'Budget night speech, May 2023',
    sourceUrl: 'https://budget.gov.au/2023-24/content/ministerial-statements/health.htm',
    measurableTarget: 'GP bulk billing rate back to 90%+ nationally by 2025',
    status: STATUS.PARTIALLY_KEPT,
    deliveredPercent: 72,
    evidence: 'Tripled bulk billing incentive took effect November 2023. National bulk billing rate rose from 77% to ~83% by Q3 2025. Regional areas still lagging; target of 90% not yet met.',
    lastChecked: '2026-03-01',
    targetDate: '2025-05-31',
  },
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    category: 'housing',
    promise: 'Launch a Help to Buy shared equity scheme to help 40,000 Australians per year buy a home with only a 2% deposit.',
    originalQuote: 'Labor\'s Help to Buy scheme will open the door to home ownership for tens of thousands of Australians who have been locked out.',
    dateMade: '2022-05-01',
    source: 'ALP 2022 election platform',
    sourceUrl: 'https://www.alp.org.au/policies/help-to-buy/',
    measurableTarget: '40,000 shared equity places per year from 2024',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 15,
    evidence: 'Help to Buy legislation passed the Senate in October 2025 after three years of delays. Implementation beginning in 2026. Far behind original 2024 start date.',
    lastChecked: '2026-03-01',
    targetDate: '2026-12-31',
  },
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    category: 'immigration',
    promise: 'Reduce net overseas migration from a record 500,000 per year to a sustainable 260,000 by 2025.',
    originalQuote: 'Net overseas migration will return to around 260,000 people per year as temporary migration normalises.',
    dateMade: '2023-12-07',
    source: 'National Population Strategy, December 2023',
    sourceUrl: 'https://www.homeaffairs.gov.au/reports-and-pubs/files/national-population-strategy-december-2023.pdf',
    measurableTarget: 'Net overseas migration ≤260,000 by financial year 2025–26',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 55,
    evidence: 'Net overseas migration fell from ~510,000 in 2023 to ~335,000 in FY2025. Student visa applications tightened. Target of 260,000 not yet reached.',
    lastChecked: '2026-03-01',
    targetDate: '2026-06-30',
  },
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    category: 'climate',
    promise: 'Achieve 82% renewable electricity by 2030 and reach net zero emissions by 2050.',
    originalQuote: '82% renewable energy by 2030. That\'s our commitment, and we\'re investing to get there.',
    dateMade: '2022-05-01',
    source: 'ALP 2022 election platform',
    sourceUrl: 'https://www.alp.org.au/policies/powering-australia/',
    measurableTarget: '82% renewable electricity share by December 2030',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 47,
    evidence: 'Australia\'s renewable share reached ~38% in 2025, up from 32% in 2022. Record solar and wind investment. On current trajectory would reach ~60% by 2030 — short of the 82% target.',
    lastChecked: '2026-03-01',
    targetDate: '2030-12-31',
  },
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    category: 'education',
    promise: 'Make 480,000 fee-free TAFE places available annually to address critical skills shortages.',
    originalQuote: 'Labor will make TAFE free for Australians studying in areas of skills need. Fee-free TAFE for 480,000 students every year.',
    dateMade: '2022-05-01',
    source: 'ALP 2022 election platform',
    sourceUrl: 'https://www.alp.org.au/policies/fee-free-tafe/',
    measurableTarget: '480,000 fee-free TAFE enrolments per year',
    status: STATUS.KEPT,
    deliveredPercent: 100,
    evidence: 'Fee-free TAFE commenced January 2023. Over 540,000 enrolments in 2024, exceeding the 480,000 target. Ongoing commitment confirmed in Budget 2025.',
    lastChecked: '2026-03-01',
    targetDate: '2025-12-31',
  },
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    category: 'defence',
    promise: 'Acquire nuclear-powered submarines through AUKUS and increase defence spending to 2.3% of GDP by 2028.',
    originalQuote: 'We are committed to AUKUS. The SSN pathway will provide Australia with sovereign naval nuclear capability by the 2030s.',
    dateMade: '2023-03-13',
    source: 'AUKUS pathway announcement, San Diego, March 2023',
    sourceUrl: 'https://www.pm.gov.au/media/aukus-optimal-pathway-joint-statement',
    measurableTarget: 'First Virginia-class submarine operational by 2032; defence spending at 2.3% GDP by 2028',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 28,
    evidence: 'AUKUS legislation passed. Australian personnel rotating through US and UK submarine programs. Defence spending at 2.07% of GDP in 2025. On track for 2.3% by 2028.',
    lastChecked: '2026-03-01',
    targetDate: '2028-12-31',
  },
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    category: 'crime',
    promise: 'Declare domestic and family violence a national emergency and fund 500 new frontline domestic violence workers.',
    originalQuote: 'We will treat domestic violence as the national emergency it is and make women safer in their homes.',
    dateMade: '2024-04-27',
    source: 'National Summit on Women\'s Safety, April 2024',
    sourceUrl: 'https://www.pm.gov.au/media/national-summit-womens-safety-2024',
    measurableTarget: '500 new DV workers deployed; national emergency declared; DV homicides fall 30% by 2027',
    status: STATUS.PARTIALLY_KEPT,
    deliveredPercent: 68,
    evidence: 'National emergency declared May 2024. 342 of 500 new frontline DV workers deployed. $925M DV package announced Budget 2024–25. DV homicide rate still elevated.',
    lastChecked: '2026-03-01',
    targetDate: '2027-12-31',
  },
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    category: 'tax',
    promise: 'Restructure the Stage 3 tax cuts to provide greater tax relief to low- and middle-income earners.',
    originalQuote: 'Every Australian taxpayer will get a tax cut. Low and middle income earners will get more under our redesigned plan.',
    dateMade: '2024-01-25',
    source: 'Press conference, January 25, 2024',
    sourceUrl: 'https://www.pm.gov.au/media/press-conference-parliament-house-canberra-25',
    measurableTarget: 'All earners under $45,000 receive a tax cut of at least $804/year from July 2024',
    status: STATUS.KEPT,
    deliveredPercent: 100,
    evidence: 'Modified Stage 3 tax cuts legislated in February 2024 and took effect July 1, 2024. Workers earning $45K receive $804 more; those earning $120K receive $2,190 less than the original plan.',
    lastChecked: '2026-03-01',
    targetDate: '2024-07-01',
  },
  {
    leaderId: 'albanese',
    leaderName: 'Anthony Albanese',
    country: 'AU',
    role: 'Prime Minister',
    category: 'infrastructure',
    promise: 'Invest $120 billion over ten years in nationally significant infrastructure through the National Infrastructure Plan.',
    originalQuote: 'Labor will invest in the transport infrastructure that connects communities, reduces congestion, and powers economic growth.',
    dateMade: '2022-05-01',
    source: 'ALP 2022 election platform',
    sourceUrl: 'https://www.alp.org.au/policies/infrastructure/',
    measurableTarget: '$120B invested in transport infrastructure over 10 years (2023–2033)',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 22,
    evidence: 'Infrastructure Investment Program delivering ~$20B committed to date, including Suburban Rail Loops, Inland Rail, and Bruce Highway upgrades. On pace for $120B over the decade.',
    lastChecked: '2026-03-01',
    targetDate: '2033-12-31',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SIR KEIR STARMER — United Kingdom
  // ══════════════════════════════════════════════════════════════════════════

  // ── Original 5 ────────────────────────────────────────────────────────────
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    category: 'housing',
    promise: 'Build 1.5 million new homes over this Parliament through major planning reform.',
    originalQuote: 'We will build 1.5 million homes over this Parliament. Planning reform starts on day one.',
    dateMade: '2024-07-05',
    source: "King's Speech, July 2024",
    sourceUrl: 'https://www.gov.uk/government/speeches/the-kings-speech-2024',
    measurableTarget: '1.5 million net housing completions by July 2029',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 10,
    evidence: 'Planning and Infrastructure Bill introduced December 2024, restoring mandatory housing targets for local authorities. ~150,000 completions in 2025 — on track only if pace accelerates significantly.',
    lastChecked: '2026-03-01',
    targetDate: '2029-07-31',
  },
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    category: 'economy',
    promise: 'Achieve the highest sustained growth in the G7 by the end of the Parliament.',
    originalQuote: 'I want the UK to have the highest sustained growth of any economy in the G7.',
    dateMade: '2024-07-05',
    source: 'Labour manifesto 2024',
    sourceUrl: 'https://labour.org.uk/change/',
    measurableTarget: 'UK GDP growth rate highest in G7 on sustained basis by 2029',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 15,
    evidence: 'UK GDP grew 0.9% in 2025, underperforming the US and Canada. The OBR revised growth forecasts downward in October 2025. Target remains achievable over a full Parliament.',
    lastChecked: '2026-03-01',
    targetDate: '2029-07-31',
  },
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    category: 'healthcare',
    promise: 'Reduce NHS waiting lists and cut treatment waiting times within five years.',
    originalQuote: 'We will get NHS waiting lists down. Within five years, we will make sure people can get a GP appointment within two weeks.',
    dateMade: '2024-07-05',
    source: 'Labour manifesto 2024',
    sourceUrl: 'https://labour.org.uk/change/',
    measurableTarget: 'NHS waiting list below 7 million; no one waiting more than 18 weeks by 2029',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 20,
    evidence: 'NHS England waiting list fell from 7.6M in July 2024 to 7.2M by January 2026 — a modest reduction. An additional £22.6B in NHS funding announced in the October 2025 Budget.',
    lastChecked: '2026-03-01',
    targetDate: '2029-07-31',
  },
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    category: 'climate',
    promise: 'Set up Great British Energy — a publicly owned clean energy company — within the first year.',
    originalQuote: 'Great British Energy. Publicly owned. Set up within the first year of a Labour government.',
    dateMade: '2024-07-05',
    source: 'Labour manifesto 2024',
    sourceUrl: 'https://labour.org.uk/change/',
    measurableTarget: 'Great British Energy operational by July 2025',
    status: STATUS.KEPT,
    deliveredPercent: 100,
    evidence: 'The Great British Energy Act received Royal Assent in February 2025, establishing the company as promised within the first year of government. Headquartered in Aberdeen.',
    lastChecked: '2026-03-01',
    targetDate: '2025-07-31',
  },
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    category: 'tax',
    promise: 'No increases to income tax rates, National Insurance contributions for workers, or VAT.',
    originalQuote: 'Labour will not increase your income tax, it will not increase National Insurance, it will not increase VAT.',
    dateMade: '2024-06-01',
    source: 'Labour manifesto 2024 / Starmer ITV debate pledge',
    sourceUrl: 'https://labour.org.uk/change/',
    measurableTarget: 'Income tax, employee NICs and VAT rates unchanged throughout Parliament',
    status: STATUS.BROKEN,
    deliveredPercent: 0,
    evidence: "The October 2025 Budget raised employers' National Insurance from 13.8% to 15% and cut the secondary threshold from £9,100 to £5,000 — widely seen as breaking the spirit of the pledge despite the technical argument it applied only to 'working people'.",
    lastChecked: '2026-03-01',
    targetDate: '2029-07-31',
  },

  // ── 10 New Starmer promises ────────────────────────────────────────────────
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    category: 'economy',
    promise: 'Double the rate of economic growth to 2% through a 10-year Industrial Strategy and National Wealth Fund.',
    originalQuote: 'We will double the rate of growth in this country. We\'ll do it through an industrial strategy, not short-term gimmicks.',
    dateMade: '2024-07-05',
    source: 'Labour manifesto 2024',
    sourceUrl: 'https://labour.org.uk/change/',
    measurableTarget: 'Sustained UK GDP growth of 2% per year by 2027',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 14,
    evidence: 'UK grew 0.9% in 2025, still half the 2% target. National Wealth Fund established with £27.8B. Industrial Strategy Council launched. OBR forecasts 1.5% growth in 2026.',
    lastChecked: '2026-03-01',
    targetDate: '2029-07-31',
  },
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    category: 'healthcare',
    promise: 'Deliver 40,000 extra NHS appointments every week within the first year in government.',
    originalQuote: 'Within our first year — 40,000 extra NHS appointments, every single week. We will bring down the waiting lists.',
    dateMade: '2024-07-05',
    source: 'Labour manifesto 2024',
    sourceUrl: 'https://labour.org.uk/change/',
    measurableTarget: '40,000 additional NHS appointments per week by July 2025',
    status: STATUS.PARTIALLY_KEPT,
    deliveredPercent: 58,
    evidence: '~23,000 additional appointments per week delivered by end of 2025 through weekend clinics and extended hours. Fell short of 40,000 target within the first year.',
    lastChecked: '2026-03-01',
    targetDate: '2025-07-31',
  },
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    category: 'housing',
    promise: 'End no-fault evictions and give private renters long-term security through the Renters Rights Act.',
    originalQuote: 'We will abolish no-fault evictions. Renters deserve security and stability in their homes.',
    dateMade: '2024-07-05',
    source: 'Labour manifesto 2024',
    sourceUrl: 'https://labour.org.uk/change/',
    measurableTarget: 'Renters Rights Act (abolishing Section 21) enacted by end of 2024',
    status: STATUS.KEPT,
    deliveredPercent: 100,
    evidence: 'The Renters Rights Act received Royal Assent on 20 October 2024, abolishing no-fault Section 21 evictions and introducing a new private rented sector ombudsman.',
    lastChecked: '2026-03-01',
    targetDate: '2024-12-31',
  },
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    category: 'immigration',
    promise: 'Smash the criminal gangs running small boat crossings across the Channel and stop the boats.',
    originalQuote: 'We will smash the gangs who are running this vile trade in human beings. This is not about being tough — it\'s about being effective.',
    dateMade: '2024-07-05',
    source: 'Labour manifesto 2024',
    sourceUrl: 'https://labour.org.uk/change/',
    measurableTarget: 'Small boat arrivals reduced by at least 50% within 2 years; organised gang prosecutions doubled',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 18,
    evidence: 'Small boat crossings rose to 36,816 in 2025, compared to 29,437 in 2024 — an increase, not decrease. EU intelligence-sharing deal struck. No trafficking network fully dismantled.',
    lastChecked: '2026-03-01',
    targetDate: '2026-07-31',
  },
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    category: 'climate',
    promise: 'Decarbonise Britain\'s electricity grid by 2030, generating 100% of power from clean sources.',
    originalQuote: 'We will build the clean energy infrastructure we need. Clean power by 2030 — that is our commitment.',
    dateMade: '2024-07-05',
    source: 'Labour manifesto 2024',
    sourceUrl: 'https://labour.org.uk/change/',
    measurableTarget: '100% clean electricity generation by December 2030',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 35,
    evidence: 'UK generated ~42% of electricity from renewables in 2025. New offshore wind auctions launched. National Energy System Operator established. On trajectory for ~65% by 2030 — below target.',
    lastChecked: '2026-03-01',
    targetDate: '2030-12-31',
  },
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    category: 'education',
    promise: 'Recruit 6,500 new expert teachers to improve educational outcomes and break down class inequality.',
    originalQuote: 'We will recruit 6,500 new teachers. This is about raising standards for every child, in every part of the country.',
    dateMade: '2024-07-05',
    source: 'Labour manifesto 2024',
    sourceUrl: 'https://labour.org.uk/change/',
    measurableTarget: '6,500 additional qualified teachers hired and in classrooms by 2029',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 9,
    evidence: 'Teacher recruitment for 2025/26 intake 11% below target. 580 additional specialist teachers hired against the 6,500 goal. Teacher pay rise of 5.5% awarded September 2025 to help attract candidates.',
    lastChecked: '2026-03-01',
    targetDate: '2029-07-31',
  },
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    category: 'defence',
    promise: 'Increase UK defence spending to 2.5% of GDP and publish a Strategic Defence Review within 12 months.',
    originalQuote: 'We will increase defence spending to 2.5% of GDP. And we will have a Strategic Defence Review done within a year.',
    dateMade: '2024-07-05',
    source: 'Labour manifesto 2024',
    sourceUrl: 'https://labour.org.uk/change/',
    measurableTarget: 'Defence at 2.5% of GDP by 2027; SDR published by July 2025',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 42,
    evidence: 'Strategic Defence Review published June 2025, on time. Defence spending increased to 2.3% of GDP in 2026 budget — approaching but not yet at 2.5%. Commitment to reach 2.5% by 2027 reiterated.',
    lastChecked: '2026-03-01',
    targetDate: '2027-12-31',
  },
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    category: 'crime',
    promise: 'Halve knife crime in England and Wales over the next decade.',
    originalQuote: 'We will halve knife crime. That is our target, and we will be held to it.',
    dateMade: '2024-07-05',
    source: 'Labour manifesto 2024',
    sourceUrl: 'https://labour.org.uk/change/',
    measurableTarget: '50% reduction in knife crime offences by 2034',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 5,
    evidence: 'Knife crime offences rose 4% in 2025 vs 2024. Safer Streets Fund extended. Ban on zombie knives enacted April 2025. Early progress is in the wrong direction; long-term structural causes unaddressed.',
    lastChecked: '2026-03-01',
    targetDate: '2034-07-31',
  },
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    category: 'tax',
    promise: 'Close non-dom tax loopholes and ensure the wealthiest pay their fair share to fund public services.',
    originalQuote: 'The non-dom status is unfair. We will abolish it and use the money to fund our NHS and schools.',
    dateMade: '2024-07-05',
    source: 'Labour manifesto 2024',
    sourceUrl: 'https://labour.org.uk/change/',
    measurableTarget: 'Non-dom regime abolished; estimated £2.7B additional revenue per year from 2025-26',
    status: STATUS.KEPT,
    deliveredPercent: 100,
    evidence: 'Non-dom tax status abolished in the October 2025 Budget, replaced with a residence-based system. Expected to raise £12.7B over five years, helping fund NHS and public services.',
    lastChecked: '2026-03-01',
    targetDate: '2025-04-06',
  },
  {
    leaderId: 'starmer',
    leaderName: 'Sir Keir Starmer',
    country: 'UK',
    role: 'Prime Minister',
    category: 'infrastructure',
    promise: 'Renationalise the rail network and establish Great British Railways as the single national rail operator.',
    originalQuote: 'We will bring rail operators into public ownership as their contracts expire. Great British Railways — one system, one organisation.',
    dateMade: '2024-07-05',
    source: 'Labour manifesto 2024',
    sourceUrl: 'https://labour.org.uk/change/',
    measurableTarget: 'All private rail franchises returned to public ownership by 2029; GBR operational',
    status: STATUS.IN_PROGRESS,
    deliveredPercent: 32,
    evidence: 'Passenger Railway Services (Public Ownership) Act passed November 2024. LNER, South Western Railway, and c2c now in public ownership. Four more operators transfer in 2026. GBR transition body established.',
    lastChecked: '2026-03-01',
    targetDate: '2029-07-31',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcPromisePoints(promise) {
  const base = STATUS_POINTS[promise.status];
  if (base !== null) return base;
  return typeof promise.deliveredPercent === 'number' ? promise.deliveredPercent : 50;
}

/**
 * Calculate a 0–100 Promise Score for a single leader.
 */
function calcLeaderScore(promises) {
  if (!promises.length) return 0;
  const total = promises.reduce((sum, p) => sum + calcPromisePoints(p), 0);
  return Math.round(total / promises.length);
}

/**
 * Plain-language status update for a single promise.
 */
function buildUpdate(promise) {
  const pct =
    promise.status === STATUS.KEPT
      ? 100
      : promise.status === STATUS.BROKEN || promise.status === STATUS.NOT_STARTED
      ? 0
      : typeof promise.deliveredPercent === 'number'
      ? promise.deliveredPercent
      : null;

  const pctStr = pct !== null ? ` — ${pct}% delivered` : '';
  const shortPromise =
    promise.promise.length > 120 ? promise.promise.slice(0, 117) + '…' : promise.promise;

  return `${promise.leaderName} promised to ${shortPromise.charAt(0).toLowerCase()}${shortPromise.slice(1)} — ${promise.evidence}${pctStr}.`;
}

// ─── Core processor ───────────────────────────────────────────────────────────

/**
 * Process promises for all leaders and return enriched records + per-leader summaries.
 *
 * @param {Array} promises - Raw promise records (defaults to built-in PROMISES)
 * @returns {{ enriched: Array, summaries: Array }}
 */
export function processPromises(promises = PROMISES) {
  const byLeader = {};
  for (const p of promises) {
    if (!byLeader[p.leaderId]) byLeader[p.leaderId] = [];
    byLeader[p.leaderId].push(p);
  }

  const enriched = promises.map((p) => ({
    ...p,
    points: calcPromisePoints(p),
    update: buildUpdate(p),
  }));

  const summaries = Object.entries(byLeader).map(([leaderId, leaderPromises]) => {
    const score = calcLeaderScore(leaderPromises);
    const counts = Object.values(STATUS).reduce((acc, s) => {
      acc[s] = leaderPromises.filter((p) => p.status === s).length;
      return acc;
    }, {});
    const rep = leaderPromises[0];

    // Category breakdown
    const byCategory = {};
    for (const p of leaderPromises) {
      if (!byCategory[p.category]) byCategory[p.category] = [];
      byCategory[p.category].push(p.status);
    }

    return {
      leaderId,
      leaderName: rep.leaderName,
      country: rep.country,
      role: rep.role,
      promiseScore: score,
      totalPromises: leaderPromises.length,
      statusBreakdown: counts,
      categoryBreakdown: byCategory,
      scoreLabel:
        score >= 75 ? 'Strong' : score >= 50 ? 'Moderate' : score >= 25 ? 'Weak' : 'Poor',
    };
  });

  return { enriched, summaries };
}

// ─── Firestore persistence ────────────────────────────────────────────────────

/**
 * Save promise records and leader summaries to Firestore "promise_tracker".
 * Clears previous docs for the provided countries before writing.
 */
export async function savePromises(enriched, summaries) {
  const col = collection(db, 'promise_tracker');
  const countries = [...new Set(enriched.map((p) => p.country))];

  await Promise.all(
    countries.map(async (country) => {
      try {
        const stale = await getDocs(query(col, where('country', '==', country)));
        await Promise.all(stale.docs.map((d) => deleteDoc(d.ref)));
      } catch (_) {
        // Non-fatal
      }
    })
  );

  let saved = 0;
  let errors = 0;

  const docs = [
    ...enriched.map((p) => ({ ...p, docType: 'promise' })),
    ...summaries.map((s) => ({ ...s, docType: 'leaderSummary' })),
  ];

  await Promise.all(
    docs.map(async (doc) => {
      try {
        await addDoc(col, { ...doc, createdAt: serverTimestamp() });
        saved++;
      } catch (e) {
        console.error('[promiseTracker] Failed to save doc:', e, doc);
        errors++;
      }
    })
  );

  return { saved, errors };
}

// ─── Top-level runner ─────────────────────────────────────────────────────────

/**
 * Run the full promise tracking pipeline and persist to Firestore.
 */
export async function runPromiseTracker(promises = PROMISES) {
  const { enriched, summaries } = processPromises(promises);

  console.log('[promiseTracker] Leader Promise Scores:');
  summaries.forEach((s) =>
    console.log(`  ${s.leaderName} (${s.country}): ${s.promiseScore}/100 — ${s.scoreLabel}`)
  );

  console.log('\n[promiseTracker] Individual promise updates:');
  enriched.forEach((p) => console.log(`  [${p.status}] ${p.update}`));

  const { saved, errors } = await savePromises(enriched, summaries);
  console.log(`\n[promiseTracker] Saved ${saved} record(s) to Firestore (${errors} error(s))`);

  return { enriched, summaries, saved, errors };
}

export default runPromiseTracker;
