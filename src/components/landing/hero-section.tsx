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
          className="w-full h-full object-cover opacity-20 sm:opacity-30"
        >
          <source src="/anna.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/30 sm:bg-black/40" />
      </div>

      {/* Main Content Container - Fully Responsive */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          
          {/* Left Content - Text Section */}
          <div className="flex-1 text-center lg:text-left max-w-2xl lg:max-w-none">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/5 backdrop-blur-sm mb-4 sm:mb-6 lg:mb-8">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1.5 sm:mr-2" />
              <span className="text-xs sm:text-sm text-gray-300">Premium AI Technology • 2025</span>
            </div>

            {/* Main Heading - Responsive Typography */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              <span className="block">Intelligent</span>
              <span className="block bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
                AI Avatars
              </span>
            </h1>

            {/* Subheading - Responsive Typography */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto lg:mx-0">
              Experience the future of professional meetings with sophisticated AI avatars
              that understand context, generate insights, and enhance collaboration.
            </p>

            {/* CTA Buttons - Responsive Layout */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start items-center mb-8 sm:mb-12">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white hover:bg-white/30 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4" 
                asChild
              >
                <Link href={session ? "/dashboard" : "/sign-in"}>
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white hover:bg-white/30 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {isVideoPlaying ? 'Pause Demo' : 'Play Demo'}
              </Button>
            </div>
          </div>

          {/* Right Content - Video Demo Section */}
          <div className="flex-1 w-full max-w-lg lg:max-w-2xl">
            <div className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4 text-center lg:text-left">
                Live AI Avatar Demo
              </h3>
              
              {/* Video Container - Responsive */}
              <div className="relative rounded-lg sm:rounded-xl overflow-hidden aspect-video">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/anna.mp4" type="video/mp4" />
                </video>
                
                {/* Play Overlay for Interactive Demo */}
                {!isVideoPlaying && (
                  <div 
                    className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer hover:bg-black/30 transition-colors"
                    onClick={() => setIsVideoPlaying(true)}
                  >
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors">
                      <Play className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-gray-400 text-xs sm:text-sm mt-3 sm:mt-4 text-center lg:text-left">
                Watch our AI avatar in action during a real meeting scenario
              </p>
            </div>
          </div>
        </div>

        {/* Full Video Demo - When Playing */}
        {isVideoPlaying && (
          <div className="mt-8 sm:mt-12 lg:mt-16 w-full max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  Full AI Avatar Demo
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVideoPlaying(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
              <div className="relative rounded-lg sm:rounded-xl overflow-hidden aspect-video">
                <video
                  autoPlay
                  controls
                  className="w-full h-full object-cover"
                >
                  <source src="/anna.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mt-3 sm:mt-4 text-center">
                Interactive demo - use controls to pause, seek, or adjust volume
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};