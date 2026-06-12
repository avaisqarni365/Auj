// @auj/core-booking — the core domain: booking lifecycle, CRM, packages, documents.
// Orchestrates the SaudiConnector / TravelSupplier interfaces + visa-router by DI.
// It never imports a concrete connector; the active one is injected (mock or real).
export * from './domain';
export * from './state-machine';
export * from './ports';
export * from './in-memory';
export * from './money';
export * from './ids';
export * from './package-builder';
export * from './crm';
export * from './document-service';
export * from './booking-service';
export * from './core';
