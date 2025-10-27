// Simplified Polar integration
export async function createPolarSubscription(userId: string, plan: string) {
  // Simplified implementation - return mock data
  return {
    id: `polar-sub-${Date.now()}`,
    status: 'active',
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  };
}

export async function cancelPolarSubscription(subscriptionId: string) {
  // Simplified implementation
  return { success: true };
}