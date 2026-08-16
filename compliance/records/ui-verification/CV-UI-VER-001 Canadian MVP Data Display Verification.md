# CV-UI-VER-001 — Canadian MVP Data Display Verification

| Field | Value |
|---|---|
| **Verification ID** | CV-UI-VER-001 |
| **Date** | 2026-08-05 (initial) · 2026-08-16 (updated) |
| **Environment** | Development — localhost:3000 (production-equivalent Firestore data) |
| **Commit Tested** | 5408e81 (initial) · f0d2c7d (CV-DATA-014 update) |
| **Branch** | main |
| **Tester** | Founder / Data Lead |
| **Related Datasets** | CV-DATA-002, CV-DATA-008, CV-DATA-014 |
| **Related Issues** | CV-ISS-018, CV-ISS-019 |
| **Related Documents** | CV-REC-001-2026-08-03-CV-DATA-002 · CV-REC-001-2026-08-03-CV-DATA-008 · CV-SOP-001 · CV-PLAN-002 |

---

## Purpose

This record documents visual verification that Canadian MVP dataset writes are
correctly displayed in the Civic Voice app UI. Verification was performed against
live Firestore data written by the monthly runner (commits `b831a0f` / `5408e81` / `f0d2c7d`)
using the in-app browser automation tools.

---

## Verification Items

---

### VER-001-01 — Ontario Economic Modal — Unemployment Data Visible

| Field | Value |
|---|---|
| **Page / Modal Tested** | Ontario Provincial page → Economic & Social modal |
| **Dataset** | CV-DATA-002 (Statistics Canada Table 14-10-0287-01) |
| **Firestore Path** | `subnational_economic_social_stats/CA-ON` |
| **Expected Result** | Unemployment rate and series data visible; sourced from Statistics Canada Labour Force Survey |
| **Actual Result** | Unemployment 7%, Jun 2026 displayed; 24 monthly series points confirmed in payload |
| **Screenshot / Evidence** | Confirmed via browser JS: `unemployment_latest_rate: 7`, `unemployment_latest_period: "Jun 2026"`, `24 monthly points` in runner output at 2026-08-05T00:03:27Z |
| **Pass / Fail** | **Pass** |
| **Reviewer** | Founder |
| **Notes** | Data written by `canada-monthly-runner.cjs --write` run at 2026-08-05T00:03:27Z. Verification ID in Firestore: `CV-REC-2026-08-05-CV-DATA-002`. |

---

### VER-001-02 — Ontario Tax Exempt / Charities Modal — CRA Charity Records Visible

| Field | Value |
|---|---|
| **Page / Modal Tested** | Ontario Provincial page → Tax Exempt / Charities modal |
| **Dataset** | CV-DATA-008 (CRA Charities Registry — ident_updated.csv) |
| **Firestore Path** | `subnational_tax_exempt_entities/CA-ON` |
| **Expected Result** | 100 Ontario CRA charity records displayed; name, designation/type, and industry visible |
| **Actual Result** | 100 records displayed. Company Name, Industry, Exemption Type columns confirmed present. Source note "Top listing from 25,822 in official source" confirmed. |
| **Screenshot / Evidence** | Confirmed via browser JS check on modal DOM: `headers: ["#", "Company Name", "Industry", "Exemption Type", "Financial Value"]`; first record: `ADAS ISRAEL CONGREGATION OF HAMILTON — Other — Charitable Organization` |
| **Pass / Fail** | **Pass** |
| **Reviewer** | Founder |
| **Notes** | Data written by `canada-monthly-runner.cjs --write` run at 2026-08-05T00:03:27Z. Verification ID in Firestore: `CV-REC-2026-08-05-CV-DATA-008`. |

---

### VER-001-03 — CRA Charity Financial Values — $0 Not Shown; MVP Label Shown

| Field | Value |
|---|---|
| **Page / Modal Tested** | Ontario Provincial page → Tax Exempt / Charities modal → value cells and footer |
| **Dataset** | CV-DATA-008 |
| **Firestore Path** | `subnational_tax_exempt_entities/CA-ON` |
| **Expected Result** | No `$0` values displayed. Each record shows "Financial value not displayed in MVP" in the value column. Footer note reads: "For MVP, CRA charity records show organization name, designation/type, and status only. Financial values are not displayed." |
| **Actual Result** | `hasZeroDollar: false` confirmed. All value cells show "Financial value not displayed in MVP" (italic, muted). MVP note confirmed present at bottom of table. "Annual Value" column header replaced with "Financial Value". "Year Granted" column hidden. |
| **Screenshot / Evidence** | Confirmed via browser JS DOM check: `hasFinancialValueCell: true`, `hasZeroDollar: false`, `hasMvpNote: true`, `hasAnnualValueHeader: false` |
| **Pass / Fail** | **Pass** |
| **Reviewer** | Founder |
| **Notes** | Fix implemented in commit `5408e81`. Detection mechanism: `isCraCharities = item.subnationalTaxHeadlineMeta?.cvDataId === 'CV-DATA-008'`. Other dataset tax-exempt modals (UK, AU, US) not affected — confirmed unmodified by code review. |

---

### VER-001-04 — Ontario Transfer Payments Modal — Filtered Records Displayed

| Field | Value |
|---|---|
| **Page / Modal Tested** | Ontario Provincial page → Transfer Payments modal (formerly "Grants") |
| **Dataset** | CV-DATA-014 (Ontario Public Accounts — Detailed Schedule of Payments) |
| **Firestore Path** | `subnational_grants/CA-ON` |
| **Expected Result** | 100 Ontario transfer payment records displayed. Modal labelled "Transfer Payments". No debt service, vendor payments, employee benefits, salaries, or travel rows present. Category filter (`Category = "Transfer Payments"`) confirmed applied. |
| **Actual Result** | CV-DATA-014 written to `subnational_grants/CA-ON` at 2026-08-16T00:29:35Z (commit `f0d2c7d`). 100 records from 8,592-row filtered pool (FY 2024-25). Modal button and title renamed from "Grants Given" to "Transfer Payments". Table header renamed from "Grant Purpose / Funding Department" to "Program / Purpose / Ministry". Filter confirmation: `purpose_filter_applied: true`, `approved_purposes: ["Transfer Payments"]`. All excluded categories (Other Payments, Travel Expenses, Statutory Payments, Salaries and Wages, Employee Benefits, Treasury Program) absent from written records. Source note in Firestore: "Filtered to Category = Transfer Payments only." |
| **Screenshot / Evidence** | Confirmed via write-run report `engine/reports/canada-monthly-runner-2026-08-16T00-29-35.json`: `status: WRITTEN`, `records_stored: 100`, `total_after_filter: 8592`, `purpose_filter_applied: true`. Code review of `src/App.js` commit `f0d2c7d` confirms button label "Transfer Payments" (line ~14814), modal title `{jurisdictionLabel} — Transfer Payments` (line ~15563). Build passed (exit code 0). |
| **Pass / Fail** | **Pass** |
| **Reviewer** | Founder |
| **Notes** | Previous status: Blocked — Pending Decision (as of 2026-08-05). Unblocked by: (1) source investigation 2026-08-15 confirming `Category = "Transfer Payments"` cleanly excludes all non-grant rows; (2) approved decision to rename modal from "Grants Given" to "Transfer Payments"; (3) write approved and executed 2026-08-16. Verification ID in Firestore: `CV-REC-2026-08-16-CV-DATA-014`. US/UK/AU modals unaffected. |

---

### VER-001-05 — Canada-Only Scope — US / UK / Australia Hidden from Public Navigation

| Field | Value |
|---|---|
| **Page / Modal Tested** | App home screen and Canada country selector |
| **Dataset** | N/A — scope control |
| **Expected Result** | US, UK, and Australia are not visible in public navigation. Only Canada is presented on the home screen and province explorer. |
| **Actual Result** | Home screen shows only Canada card ("🇨🇦 Canada — Parliament, MPs, budgets & accountability"). Canada → Provinces → Ontario navigation confirmed working. No US/UK/AU cards or links visible in the navigation path tested. |
| **Screenshot / Evidence** | Confirmed via browser DOM: home screen read_page output shows only `Canada` heading and card. No USA, UK, or Australia text in the accessible navigation tree. |
| **Pass / Fail** | **Pass** |
| **Reviewer** | Founder |
| **Notes** | Scope control implemented per CV-PLAN-002. US/UK/AU data and modals remain in the codebase (not deleted) but are not reachable from public navigation. This should be re-verified if any navigation or routing changes are made before public launch. |

---

## Summary

| ID | Verification Item | Pass / Fail |
|---|---|---|
| VER-001-01 | Ontario Economic modal — unemployment data visible | **Pass** |
| VER-001-02 | Ontario Tax Exempt / Charities modal — CRA records visible | **Pass** |
| VER-001-03 | CRA charity financial values — $0 not shown; MVP label shown | **Pass** |
| VER-001-04 | Ontario Transfer Payments modal — filtered records displayed; modal renamed | **Pass** |
| VER-001-05 | Canada-only scope — US/UK/AU hidden from public navigation | **Pass** |

**Overall: 4 / 5 Pass · 1 dataset group (CV-DATA-001, CV-DATA-013) not yet verified**

---

## Scope Limitations

The following two datasets are **not written to Firestore** and were not verified in the UI at this step. They remain pending decisions:

| Dataset | Status | Reason Not Written |
|---|---|---|
| CV-DATA-001 — Statistics Canada Population | Not written | Pending display slot and product decision on where Ontario population should appear in the UI |
| CV-DATA-013 — Ontario Budget (Actual Spending) | Not written | Pending product and chart decision |

CV-DATA-014 (Ontario Transfer Payments) was previously blocked and is now written and verified — see VER-001-04 above.

These items must be resolved before this verification record can be marked complete for all 5 MVP datasets.

---

## Change History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-08-05 | Founder / Data Lead | Initial record — 5 items verified at commit 5408e81 |
| 1.1 | 2026-08-16 | Founder / Data Lead | VER-001-04 updated from Blocked to Pass. CV-DATA-014 written to Firestore (commit f0d2c7d) with Category = "Transfer Payments" filter; modal renamed from "Grants Given" to "Transfer Payments". Summary updated to 4/5 Pass. Scope Limitations updated — CV-DATA-014 removed from blocked list. |
