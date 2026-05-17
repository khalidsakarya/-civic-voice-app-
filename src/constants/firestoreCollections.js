/**
 * Federal Register presidential documents (EOs, proclamations, …). The Executive Orders screen queries
 * this collection with `type` restricted to Executive Order classes — see `executiveOrderDocumentTypes.js`.
 */
export const EXECUTIVE_ACTIONS_COLLECTION = 'executive_actions';

/**
 * Optional Admin sync target (`engine/sync-us-executive-orders.cjs`). UI reads `executive_actions`, not this collection.
 */
export const EXECUTIVE_ORDERS_COLLECTION = 'executive_orders';

/** Curated state/province/region reference rows (seeded from static canonical data). */
export const SUBNATIONAL_JURISDICTIONS_COLLECTION = 'subnational_jurisdictions';

/** Engine-maintained aggregate docs for dashboard-style counts (read-only in the app). */
export const SUMMARY_STATS_COLLECTION = 'summary_stats';

/** Per-jurisdiction transparency modal payloads (doc id = jurisdiction id, e.g. `CA-ON`). */
export const SUBNATIONAL_ECONOMIC_SOCIAL_STATS_COLLECTION = 'subnational_economic_social_stats';
export const SUBNATIONAL_TAX_EXEMPT_ENTITIES_COLLECTION = 'subnational_tax_exempt_entities';
export const SUBNATIONAL_GRANTS_COLLECTION = 'subnational_grants';
