"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Play } from "lucide-react";
import { useState } from "react";

interface HeroSectionProps {
  session?: any;
}

export const HeroSection = ({ session }: HeroSectionProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-30"
        >
          <source src="/anna.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-8">
            <Zap className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-300">Premium AI Technology • 2025</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Intelligent{" "}
            <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
              AI Avatars
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience the future of professional meetings with sophisticated AI avatars
            that understand context, generate insights, and enhance collaboration.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/30 text-lg px-8 py-4" asChild>
              <Link href={session ? "/dashboard" : "/sign-in"}>
                Go to Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/30 text-lg px-8 py-4"
              onClick={() => setIsVideoPlaying(!isVideoPlaying)}
            >
              <Play className="w-5 h-5 mr-2" />
              {isVideoPlaying ? 'Pause Demo' : 'Play Demo'}
            </Button>
          </div>

          {/* Video Demo Section */}
          {isVideoPlaying && (
            <div className="mt-16 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4">Live AI Avatar Demo</h3>
                <div className="relative rounded-xl overflow-hidden">
                  <video
                    autoPlay
                    controls
                    className="w-full h-auto"
                  >
                    <source src="/anna.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <p className="text-gray-400 text-sm mt-4 text-center">
                  Watch our AI avatar in action during a real meeting scenario
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};