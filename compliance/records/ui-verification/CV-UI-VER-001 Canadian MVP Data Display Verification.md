# CV-UI-VER-001 — Canadian MVP Data Display Verification

| Field | Value |
|---|---|
| **Verification ID** | CV-UI-VER-001 |
| **Date** | 2026-08-05 |
| **Environment** | Development — localhost:3000 (production-equivalent Firestore data) |
| **Commit Tested** | 5408e81 |
| **Branch** | main |
| **Tester** | Founder / Data Lead |
| **Related Datasets** | CV-DATA-002, CV-DATA-008 |
| **Related Issues** | CV-ISS-018, CV-ISS-019 |
| **Related Documents** | CV-REC-001-2026-08-03-CV-DATA-002 · CV-REC-001-2026-08-03-CV-DATA-008 · CV-SOP-001 · CV-PLAN-002 |

---

## Purpose

This record documents visual verification that Canadian MVP dataset writes are
correctly displayed in the Civic Voice app UI. Verification was performed against
live Firestore data written by the monthly runner (commit `b831a0f` / `5408e81`)
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

### VER-001-04 — Ontario Grants Modal — Misleading Payments Not Shown

| Field | Value |
|---|---|
| **Page / Modal Tested** | Ontario Provincial page → Grants modal |
| **Dataset** | CV-DATA-014 (Ontario Public Accounts — Detailed Schedule of Payments) |
| **Firestore Path** | `subnational_grants/CA-ON` |
| **Expected Result** | Dataset not written. Grants modal should show no live data for Ontario. No debt service, vendor, or OHIP payments should appear under "Grants". |
| **Actual Result** | CV-DATA-014 deliberately not written. Replacement source (broad Public Accounts Detailed Schedule of Payments) may be misleading if displayed under "Grants" without additional product decisions on labelling and display context. Purpose filter is implemented in `buildGrants()` (commit `fe39baa`) and confirmed working in dry-run (165 rows pass filter), but no write has been approved pending the product decision. |
| **Screenshot / Evidence** | Not applicable — dataset not written. Monthly runner dry-run report confirms filter status: `engine/reports/canada-monthly-runner-2026-08-05T00-03-27.json`, CV-DATA-014 status `DRY-RUN`. |
| **Pass / Fail** | **Blocked — Pending Decision** |
| **Reviewer** | Founder |
| **Notes** | Do not write CV-DATA-014 until a product decision is made on source, labelling, and display context for the Grants modal. Purpose filter code is in place and verified. Write can proceed once the display decision is approved. |

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
| VER-001-04 | Ontario Grants modal — misleading payments not shown | **Blocked — Pending Decision** |
| VER-001-05 | Canada-only scope — US/UK/AU hidden from public navigation | **Pass** |

**Overall: 3 / 5 Pass · 1 Blocked — Pending Decision · 1 dataset group (CV-DATA-001, CV-DATA-013) not yet verified**

---

## Scope Limitations

The following three datasets are **not written to Firestore** and were not verified in the UI at this step. They remain pending decisions:

| Dataset | Status | Reason Not Written |
|---|---|---|
| CV-DATA-001 — Statistics Canada Population | Not written | Pending display slot and product decision on where Ontario population should appear in the UI |
| CV-DATA-013 — Ontario Budget (Actual Spending) | Not written | Pending product and chart decision |
| CV-DATA-014 — Ontario Grants / Transfer Payments | Not written — **deliberately blocked** | Replacement source is the broad Ontario Public Accounts Detailed Schedule of Payments. Displaying this under "Grants" may be misleading because the full file contains debt service and vendor payments in addition to transfer payments. Blocked pending further product decision on source, labelling, and display context. |

These items must be resolved before this verification record can be marked complete for all 5 MVP datasets.

---

## Change History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-08-05 | Founder / Data Lead | Initial record — 5 items verified at commit 5408e81 |
