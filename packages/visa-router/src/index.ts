// @auj/visa-router — pure eligibility engine deciding e-visa vs agent channel.
// No I/O. Consumed by core-booking and both apps. The connector only SUBMITS the
// visa; this module DECIDES the route.
export * from './config';
export * from './router';
