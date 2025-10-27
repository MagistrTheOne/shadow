import { Polar } from '@polar-sh/sdk';

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!
});

export async function createSubscription(userId: string, plan: string) {
  try {
    const subscription = await polarClient.subscriptions.create({
      organizationId: process.env.POLAR_ORGANIZATION_ID!,
      customerId: userId,
      productId: plan,
      priceId: `${plan}_price_id`
    });

    return subscription;
  } catch (error) {
    console.error('Failed to create Polar subscription:', error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await polarClient.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Failed to cancel Polar subscription:', error);
    throw error;
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await polarClient.subscriptions.get(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Failed to get Polar subscription:', error);
    throw error;
  }
}

export async function createPaymentIntent(amount: number, currency: string = 'USD') {
  try {
    const paymentIntent = await polarClient.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: currency.toLowerCase(),
      organizationId: process.env.POLAR_ORGANIZATION_ID!
    });

    return paymentIntent;
  } catch (error) {
    console.error('Failed to create payment intent:', error);
    throw error;
  }
}
