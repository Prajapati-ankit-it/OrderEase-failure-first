export enum OrderState {
  INIT = 'INIT',                     // no events yet
  REQUESTED = 'REQUESTED',
  VALIDATED = 'VALIDATED',
  PAYMENT_IN_PROGRESS = 'PAYMENT_IN_PROGRESS',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}
