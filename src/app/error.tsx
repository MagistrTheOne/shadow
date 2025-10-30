'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

export default function ErrorPage() {
  const errorId = Date.now();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d10] via-[#101018] to-[#0b0b0e] flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto glass-strong p-10 rounded-2xl border border-white/10 shadow-[0_0_40px_-10px_rgba(148,163,184,0.25)]">
        <div className="mb-8">
          <div className="w-32 h-32 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[inset_0_0_20px_rgba(139,92,246,0.25)]">
            <AlertTriangle className="w-16 h-16 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-semibold text-white mb-3 tracking-tight">
            Something went wrong
          </h1>
          <p className="text-slate-400 text-base mb-8">
            An unexpected error occurred. Our system has logged the issue and it’s being investigated.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full bg-indigo-500/10 border border-indigo-400/20 text-white hover:bg-indigo-500/20 hover:border-indigo-400/40 transition-all"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>

          <Link href="/">
            <Button className="w-full bg-slate-700/10 border border-slate-400/20 text-white hover:bg-slate-600/20 hover:border-slate-400/40 transition-all">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Error Details */}
        <div className="mt-10 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg">
          <p className="text-slate-400 text-sm mb-1">
            Error ID: <span className="text-indigo-300 font-mono">{errorId}</span>
          </p>
          <p className="text-slate-500 text-xs">
            Include this ID when contacting support for faster assistance.
          </p>
        </div>

        {/* Contact */}
        <div className="mt-6 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg">
          <p className="text-slate-400 text-sm">
            Need immediate help? Contact us at{" "}
            <Link
              href="/company/contact"
              className="text-indigo-300 hover:text-white underline"
            >
              magistrtheone@gmail.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
