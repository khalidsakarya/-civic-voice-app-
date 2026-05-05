/**
 * Federal Register presidential documents (EOs, proclamations, …). The Executive Orders screen queries
 * this collection with `type` restricted to Executive Order classes — see `executiveOrderDocumentTypes.js`.
 */
export const EXECUTIVE_ACTIONS_COLLECTION = 'executive_actions';

/**
 * Optional Admin sync target (`engine/sync-us-executive-orders.cjs`). UI reads `executive_actions`, not this collection.
 */
export const EXECUTIVE_ORDERS_COLLECTION = 'executive_orders';
