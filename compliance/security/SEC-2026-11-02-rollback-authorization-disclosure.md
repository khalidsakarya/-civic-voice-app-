# SEC-2026-11-02 — Disclosure of deterministic rollback-confirmation values (CA-NT / CA-NU) and forward fix

| Field | Value |
|---|---|
| **Date identified** | 2026-11-02 |
| **Status** | Remediated going forward. Git history intentionally NOT rewritten. |
| **Affected** | Public Git history, commit `fe71770` (and the commits that introduced the original rollback tooling, `5db796f`). |
| **Severity** | Low to moderate: a confirmation value, not a credential. No production data was changed. |
| **Owner** | Founder / Data Lead |

## What was disclosed

The first rollback design for the two newly created charity documents (`subnational_tax_exempt_entities/CA-NT` and `/CA-NU`) required a typed confirmation value equal to the document id plus the first 12 hexadecimal characters of the SHA-256 of the stored data. That value could therefore be derived from public information. In commit `fe71770` (pushed to the public repository) the following were published:

- the two creation receipt copies (`compliance/receipts/created__CA-XX__<timestamp>.receipt.json`), which contain the full data hash;
- the two derived confirmation values, in the compliance records and in the prepared and run reports;
- the full data hashes, in the compliance records and the prepared report.

The actual values are deliberately **not repeated in this note**.

## Why the practical risk was limited

A rollback also required Firebase Admin credentials for the production project (never in the repository), a document unchanged since creation (matching createTime, updateTime and data hash), the project guard, and a verified backup before any delete. Both documents were unchanged and **no rollback was ever executed**. Even so, the confirmation value no longer represented a separate, private human authorization, so it is treated as permanently disclosed.

## Forward fix (2026-11-02)

1. **Published material removed from the tracked repository.** The two receipt copies were deleted; token values and full data hashes were removed from every tracked file. The compliance records were kept, with non-sensitive audit references only (jurisdiction, source, verification status, creation date, verification results, receipt file name, SHA-256 of the receipt *file*, Firestore createTime, record counts). The original receipts remain in the private backup directory outside the repository.
2. **Rollback authorization replaced.** An authorization is now a private file issued by a separate, deliberate command (`engine/canada-charities-rollback-authorize.cjs`): a random 256-bit nonce (`crypto.randomBytes`), bound to one receipt file, one document path and one Firebase project, authenticated with HMAC-SHA256 under a random 256-bit key. The key and the authorization files exist only in the private backup directory. Values are never derived from document ids, hashes, timestamps or other public metadata, and are never printed, logged or returned.
3. **Old values rejected.** The retired token format, and anything derived from a receipt hash, is rejected (covered by tests). The command-line flag that accepted it no longer exists.
4. **A valid authorization alone cannot delete.** The operator must also confirm the exact Firebase project and the exact document path (`--confirm-project`, `--confirm-document`). All previous checks remain: receipt validity, live project, createTime, updateTime, data hash, no foreign fields, a verified full backup before deletion, a `lastUpdateTime` precondition on the delete, and fail-closed behaviour. Importing the modules or running the test suite cannot authorize or execute a rollback.

## What was not done, by decision

- Git history was **not** rewritten and `main` was **not** force-pushed.
- Historical commits, including `fe71770`, **remain publicly accessible** and still contain the old values. Because the old format is rejected by the current implementation, those values carry no authority.
- No Firestore document was written, deleted or rolled back as part of this fix.

## Residual risk and follow-up

- The old values stay readable in history and in any clone or cache. They can no longer be used with the current tooling. Anyone running an old checkout of the tooling would still need production credentials.
- No rollback authorization has been issued for CA-NT or CA-NU. If a rollback is ever required, issue one deliberately, rehearse with the dry run, and confirm the project and document explicitly.
- Do not commit receipts, authorization files or the private key; the private backup directory is outside the repository and the tooling refuses to write into any git repository.
