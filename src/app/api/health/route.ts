import { NextResponse } from "next/server";

export async function GET() {
  // Basic liveness endpoint. Extend with deeper checks (DB, external services) if required.
  const body = {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  } as const;

  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      pragma: "no-cache",
      expires: "0",
    },
  });
}


