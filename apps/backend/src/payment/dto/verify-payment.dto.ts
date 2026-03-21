/**
 * Verify Payment DTO
 * Input validation for payment verification
 */

export class VerifyPaymentDto {
  paymentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}
