import { OrderState } from './order-state';
import { OrderEventType } from '@prisma/client';

export const ALLOWED_TRANSITIONS: Record<
  OrderState,
  OrderEventType[]
> = {
  [OrderState.INIT]: [
    OrderEventType.ORDER_REQUESTED,
  ],

  [OrderState.REQUESTED]: [
    OrderEventType.ORDER_VALIDATED,
    OrderEventType.ORDER_CANCELLED,
  ],

  [OrderState.VALIDATED]: [
    OrderEventType.PAYMENT_INITIATED,
    OrderEventType.ORDER_CANCELLED,
  ],

  [OrderState.PAYMENT_IN_PROGRESS]: [
    OrderEventType.PAYMENT_SUCCEEDED,
    OrderEventType.PAYMENT_FAILED,
  ],

  [OrderState.FAILED]: [
    OrderEventType.PAYMENT_INITIATED, // retry allowed
    OrderEventType.ORDER_CANCELLED,
  ],

  [OrderState.CONFIRMED]: [], // terminal

  [OrderState.CANCELLED]: [], // terminal
};

export function assertValidTransition(
  currentState: OrderState,
  nextEvent: OrderEventType,
) {
  if (nextEvent === OrderEventType.PAYMENT_REFUNDED) {
    if (currentState !== OrderState.CANCELLED) {
      throw new Error(
        `Refund allowed only for CANCELLED orders. Current state: ${currentState}`,
      );
    }
    return; // valid, no state transition
  }
  const allowedEvents = ALLOWED_TRANSITIONS[currentState];

  if (!allowedEvents.includes(nextEvent)) {
    throw new Error(
      `Invalid transition: ${currentState} -> ${nextEvent}`,
    );
  }
}
