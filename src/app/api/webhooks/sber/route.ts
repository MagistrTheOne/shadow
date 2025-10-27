import { NextRequest, NextResponse } from 'next/server';
import { sberPaymentService } from '@/lib/sber-payments';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    await sberPaymentService.handleWebhook(data);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Sber webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
