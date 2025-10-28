import { NextRequest, NextResponse } from "next/server";
import { setupAnnaAgent } from "@/lib/anna-setup";

export async function POST(request: NextRequest) {
  try {
    const success = await setupAnnaAgent();
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: "ANNA agent setup completed successfully" 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Failed to setup ANNA agent" 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error setting up ANNA agent:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { isAnnaAvailable } = await import("@/lib/anna-setup");
    const available = await isAnnaAvailable();
    
    return NextResponse.json({ 
      available,
      message: available ? "ANNA is available" : "ANNA is not available" 
    });
  } catch (error: any) {
    console.error("Error checking ANNA availability:", error);
    return NextResponse.json({ 
      available: false, 
      message: error.message 
    }, { status: 500 });
  }
}
