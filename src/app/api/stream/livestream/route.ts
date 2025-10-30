import { NextRequest, NextResponse } from 'next/server';
import { authClient } from '@/lib/auth-client';

const STREAM_API_KEY = process.env.STREAM_API_KEY!;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET!;

/**
 * Start livestream for a call
 * Uses Stream Video Backend API to create livestream
 * Documentation: https://getstream.io/video/docs/api/livestreaming/
 */
export async function POST(request: NextRequest) {
  try {
    const session = await authClient.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { callId, rtmpUrl, callType = 'default' } = await request.json();

    if (!callId) {
      return NextResponse.json({ error: 'Call ID is required' }, { status: 400 });
    }

    if (!STREAM_API_KEY || !STREAM_API_SECRET) {
      return NextResponse.json(
        { error: 'Stream API credentials not configured' },
        { status: 500 }
      );
    }

    // Use Stream Video Backend API to create livestream
    // API endpoint: https://video.stream-io-api.com/v1.0/livestreams/
    const apiUrl = process.env.STREAM_VIDEO_API_URL || 'https://video.stream-io-api.com';
    const response = await fetch(
      `${apiUrl}/v1.0/livestreams/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STREAM_API_KEY}:${STREAM_API_SECRET}`,
          'Content-Type': 'application/json',
          'Stream-Auth-Type': 'jwt',
        },
        body: JSON.stringify({
          call_cid: `${callType}:${callId}`,
          ...(rtmpUrl && { rtmp_url: rtmpUrl }),
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { detail: errorText || 'Failed to start livestream' };
      }
      
      console.error('Stream API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        callCid: `${callType}:${callId}`,
      });
      
      throw new Error(
        errorData.detail || 
        errorData.message || 
        `Stream API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      livestreamId: data.id || data.livestream_id,
      rtmpUrl: data.rtmp_url || data.rtmpUrl,
      hlsUrl: data.hls_url || data.hlsUrl,
      streamKey: data.stream_key || data.streamKey,
      playbackUrl: data.playback_url || data.playbackUrl,
      callCid: `${callType}:${callId}`,
    });
  } catch (error: any) {
    console.error('Error starting livestream:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start livestream' },
      { status: 500 }
    );
  }
}

/**
 * Stop livestream for a call
 * Documentation: https://getstream.io/video/docs/api/livestreaming/
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await authClient.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const livestreamId = searchParams.get('livestreamId');

    if (!livestreamId) {
      return NextResponse.json({ error: 'Livestream ID is required' }, { status: 400 });
    }

    if (!STREAM_API_KEY || !STREAM_API_SECRET) {
      return NextResponse.json(
        { error: 'Stream API credentials not configured' },
        { status: 500 }
      );
    }

    const apiUrl = process.env.STREAM_VIDEO_API_URL || 'https://video.stream-io-api.com';
    const response = await fetch(
      `${apiUrl}/v1.0/livestreams/${livestreamId}/`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${STREAM_API_KEY}:${STREAM_API_SECRET}`,
          'Stream-Auth-Type': 'jwt',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { detail: errorText || 'Failed to stop livestream' };
      }
      
      console.error('Stream API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      
      throw new Error(
        errorData.detail || 
        errorData.message || 
        `Stream API error: ${response.status} ${response.statusText}`
      );
    }

    // Stream API returns 204 No Content on success for DELETE
    return NextResponse.json({ 
      success: true,
      message: 'Livestream stopped successfully' 
    });
  } catch (error: any) {
    console.error('Error stopping livestream:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to stop livestream' },
      { status: 500 }
    );
  }
}

/**
 * Get livestream status
 * Documentation: https://getstream.io/video/docs/api/livestreaming/
 */
export async function GET(request: NextRequest) {
  try {
    const session = await authClient.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const livestreamId = searchParams.get('livestreamId');
    const callCid = searchParams.get('callCid');

    if (!livestreamId && !callCid) {
      return NextResponse.json(
        { error: 'Livestream ID or Call CID is required' },
        { status: 400 }
      );
    }

    if (!STREAM_API_KEY || !STREAM_API_SECRET) {
      return NextResponse.json(
        { error: 'Stream API credentials not configured' },
        { status: 500 }
      );
    }

    const apiUrl = process.env.STREAM_VIDEO_API_URL || 'https://video.stream-io-api.com';
    const endpoint = livestreamId 
      ? `${apiUrl}/v1.0/livestreams/${livestreamId}/`
      : `${apiUrl}/v1.0/livestreams/?call_cid=${encodeURIComponent(callCid!)}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${STREAM_API_KEY}:${STREAM_API_SECRET}`,
        'Stream-Auth-Type': 'jwt',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { detail: errorText || 'Failed to get livestream status' };
      }
      
      throw new Error(
        errorData.detail || 
        errorData.message || 
        `Stream API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      livestream: Array.isArray(data.results) ? data.results[0] : data,
    });
  } catch (error: any) {
    console.error('Error getting livestream status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get livestream status' },
      { status: 500 }
    );
  }
}

