"use client";

import { httpBatchLink } from "@trpc/client";
import { createTRPCProxyClient } from "@trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";

function getUrl() {
  if (typeof window === "undefined") return "";
  if (process.env.VERCEL_URL) return "";
  return process.env.NEXT_PUBLIC_APP_URL || "";
}

export function getTrpcClient() {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${getUrl()}/api/trpc`,
        headers() {
          return {
            authorization:
              typeof window !== "undefined"
                ? `Bearer ${localStorage.getItem("auth-token")}`
                : "",
          };
        },
      }),
    ],
  });
}

