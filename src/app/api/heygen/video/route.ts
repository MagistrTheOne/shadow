import { NextRequest, NextResponse } from 'next/server';
import { heygenService } from '@/lib/ai/heygen-service';

export async function POST(request: NextRequest) {
  try {
    const { text, type, userName } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    let response;

    switch (type) {
      case 'welcome':
        response = await heygenService.createAnnaWelcomeVideo(userName || 'User');
        break;
      case 'meeting_start':
        response = await heygenService.createAnnaMeetingVideo(text, 'start');
        break;
      case 'meeting_end':
        response = await heygenService.createAnnaMeetingVideo(text, 'end');
        break;
      case 'meeting_reminder':
        response = await heygenService.createAnnaMeetingVideo(text, 'reminder');
        break;
      case 'notification':
        response = await heygenService.createAnnaNotificationVideo(text);
        break;
      default:
        response = await heygenService.createAnnaVideo(text);
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('HeyGen API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate video' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    const response = await heygenService.getVideoStatus(videoId);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('HeyGen status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get video status' },
      { status: 500 }
    );
  }
}
