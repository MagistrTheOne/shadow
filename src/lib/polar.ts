// Real Polar integration
const POLAR_API_URL = process.env.POLAR_API_URL || 'https://api.polar.sh';
const POLAR_API_KEY = process.env.POLAR_API_KEY;

export async function createPolarSubscription(userId: string, plan: string) {
  if (!POLAR_API_KEY) {
    throw new Error('Polar API key not configured');
  }

  try {
    const response = await fetch(`${POLAR_API_URL}/v1/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POLAR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: userId,
        product_id: plan,
        price_id: getPriceId(plan),
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?subscription=cancelled`,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Polar API error: ${error.message || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Polar subscription:', error);
    throw error;
  }
}

export async function cancelPolarSubscription(subscriptionId: string) {
  if (!POLAR_API_KEY) {
    throw new Error('Polar API key not configured');
  }

  try {
    const response = await fetch(`${POLAR_API_URL}/v1/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POLAR_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Polar API error: ${error.message || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling Polar subscription:', error);
    throw error;
  }
}

export async function getPolarSubscription(subscriptionId: string) {
  if (!POLAR_API_KEY) {
    throw new Error('Polar API key not configured');
  }

  try {
    const response = await fetch(`${POLAR_API_URL}/v1/subscriptions/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${POLAR_API_KEY}`,
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Polar API error: ${error.message || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Polar subscription:', error);
    throw error;
  }
}

function getPriceId(plan: string): string {
  const priceIds: Record<string, string> = {
    free: process.env.POLAR_FREE_PRICE_ID || '',
    pro: process.env.POLAR_PRO_PRICE_ID || '',
    enterprise: process.env.POLAR_ENTERPRISE_PRICE_ID || '',
  };
  
  return priceIds[plan] || priceIds.free;
}