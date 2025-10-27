// Simplified Sber payments integration
export async function processSberPayment(request: any) {
  // Simplified implementation
  return {
    orderId: request.orderNumber,
    status: 'completed',
    amount: request.amount,
  };
}

export async function createSberPaymentLink(amount: number, orderId: string) {
  // Simplified implementation
  return `https://sber-payment-link.com/${orderId}`;
}