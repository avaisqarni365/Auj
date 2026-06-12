// @auj/contracts — the single source of truth for shared domain types,
// runtime schemas, and the connector/supplier interfaces (ports).
// Product modules import from here; concrete adapters map vendor payloads INTO these types.
//
// The reusable contract-test suite lives at @auj/contracts/contract-tests
// (separate entry so importing the types never pulls in a test runner).
export * from './money';
export * from './domain';
export * from './ports';
export * from './version';
