import { NextRequest, NextResponse } from "next/server";
import { heygenService } from "@/lib/ai/heygen-service";

export async function POST(request: NextRequest) {
  try {
    const { text, voice_id, background, ratio } = await request.json();

    if (!text) {
      return NextResponse.json({ 
        success: false, 
        message: "Text is required" 
      }, { status: 400 });
    }

    const response = await heygenService.createAnnaVideo(text, {
      voice_id: voice_id || "1bd001e7c8f74e5ba8d4a16c8b5a7c8b", // ANNA's default voice
      background: background || "transparent",
      ratio: ratio || "16:9"
    });

    if (response.code === 0) {
      return NextResponse.json({ 
        success: true, 
        data: response.data,
        message: "Video created successfully" 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: response.message 
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error creating ANNA video:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json({ 
        success: false, 
        message: "Video ID is required" 
      }, { status: 400 });
    }

    const response = await heygenService.getVideoStatus(videoId);

    return NextResponse.json({ 
      success: true, 
      data: response.data,
      message: "Video status retrieved successfully" 
    });
  } catch (error: any) {
    console.error("Error getting video status:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
