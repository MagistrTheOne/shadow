import { NextRequest, NextResponse } from 'next/server';
import { HeyGenAvatarService } from '@/lib/heygen-avatar';

export async function POST(request: NextRequest) {
  try {
    const { text, avatarId, voiceId } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    const avatarService = new HeyGenAvatarService({
      apiKey,
      avatarId: avatarId || process.env.HEYGEN_AVATAR_ID || 'default',
      voiceId: voiceId || process.env.HEYGEN_VOICE_ID || 'default',
      language: 'en',
      quality: 'medium'
    });

    await avatarService.initialize();
    await avatarService.startSession();
    await avatarService.speak(text);
    await avatarService.stopSession();

    return NextResponse.json({ 
      success: true, 
      message: 'Avatar speech generated successfully' 
    });

  } catch (error: any) {
    console.error('HeyGen API error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate avatar speech' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    // Return available avatars and voices
    return NextResponse.json({
      success: true,
      avatars: [
        { id: 'default', name: 'Default Avatar' },
        { id: 'professional', name: 'Professional Avatar' },
        { id: 'friendly', name: 'Friendly Avatar' }
      ],
      voices: [
        { id: 'default', name: 'Default Voice' },
        { id: 'male', name: 'Male Voice' },
        { id: 'female', name: 'Female Voice' }
      ]
    });

  } catch (error: any) {
    console.error('HeyGen API error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to get HeyGen configuration' 
    }, { status: 500 });
  }
}
