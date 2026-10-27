import "server-only";
// Future cart operations must pass the per-visitor context token to storeRequest.
// No shared cart, customer session, or checkout is created in this phase.
export type CommerceSession = { contextToken: string };
