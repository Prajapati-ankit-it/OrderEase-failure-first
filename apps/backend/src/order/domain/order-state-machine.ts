import { OrderEventType } from '@prisma/client';
import { OrderState } from './order-state';

export function deriveOrderState(
  events: { type: OrderEventType }[],
): OrderState {
  let state: OrderState = OrderState.INIT;

  for (const event of events) {
    switch (event.type) {
      case OrderEventType.ORDER_REQUESTED:
        state = OrderState.REQUESTED;
        break;

      case OrderEventType.ORDER_VALIDATED:
        state = OrderState.VALIDATED;
        break;

      case OrderEventType.PAYMENT_INITIATED:
        state = OrderState.PAYMENT_IN_PROGRESS;
        break;

      case OrderEventType.PAYMENT_SUCCEEDED:
        state = OrderState.CONFIRMED;
        break;

      case OrderEventType.PAYMENT_FAILED:
        state = OrderState.FAILED;
        break;

      case OrderEventType.ORDER_CANCELLED:
        state = OrderState.CANCELLED;
        break;

      default:
        // future-proofing
        // eslint-disable-next-line no-self-assign
        state = state;
    }
  }

  return state;
}
