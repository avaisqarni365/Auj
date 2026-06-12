// @auj/web-b2c — the public booking funnel, framework-light. Screens + funnel
// state + usecases run on the BookingApi / PaymentsApi ports; the Next.js shell
// (added next) provides routing, fonts, i18n <html dir> and a real backend.
export * from './ports';
export * from './fx';
export * from './i18n';
export * from './funnel';
export * from './usecases';
export * from './screens';
export { createInProcessBackend } from './backend/in-process';
