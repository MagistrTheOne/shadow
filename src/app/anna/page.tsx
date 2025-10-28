import { Suspense } from "react";
import { AnnaPageClient } from "./anna-client";

export default function AnnaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
      <Suspense fallback={<div>Loading ANNA...</div>}>
        <AnnaPageClient />
      </Suspense>
    </div>
  );
}
