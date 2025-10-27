import { NextRequest, NextResponse } from 'next/server';
import { handleWebhookEvent } from '@/lib/polar-subscriptions';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('polar-signature');

    // Verify webhook signature (implement based on Polar docs)
    // const isValid = verifyPolarSignature(body, signature);
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const event = JSON.parse(body);
    
    await handleWebhookEvent(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
