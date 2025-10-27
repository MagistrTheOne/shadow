'use client'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-32 h-32 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-16 h-16 text-gray-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Something went wrong</h1>
          <p className="text-gray-400 text-lg mb-8">
            We're sorry, but something unexpected happened. Our team has been notified and is working to fix the issue.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Link href="/">
            <Button className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Error Details */}
        <div className="mt-12 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">Error ID: {Date.now()}</p>
          <p className="text-gray-500 text-xs">
            Please include this ID when contacting support for faster assistance.
          </p>
        </div>

        {/* Contact */}
        <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
          <p className="text-gray-400 text-sm">
            Need immediate help? Contact us at{" "}
            <Link href="/company/contact" className="text-gray-300 hover:text-white underline">
              magistrtheone@gmail.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
