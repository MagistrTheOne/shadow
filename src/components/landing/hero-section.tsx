"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Maximize2, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";

interface HeroSectionProps {
  session?: any;
}

export const HeroSection = ({ session }: HeroSectionProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />

      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-[center_top_25%] opacity-40 sm:opacity-50"
        >
          <source src="/anna.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left column */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm mb-6">
            <Zap className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-300">
                {t('landing.hero.badge')}
              </span>
          </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              <span className="block">{t('landing.hero.title1')}</span>
              <span className="block bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
                {t('landing.hero.title2')}
            </span>
          </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 leading-relaxed max-w-3xl mx-auto lg:mx-0">
              {t('landing.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {/* Временно закомментировано */}
              {/* <Button
                size="lg"
                className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white hover:bg-white/30 text-lg px-8 py-4"
                asChild
              >
                <Link href={session ? "/dashboard" : "/sign-in"}>
                  {t('landing.hero.cta')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              </Button> */}
            </div>
          </div>

          {/* Right column — Avatar video */}
          <div className="flex-1 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg relative mt-8 lg:mt-0">
            <div
              className="relative rounded-xl overflow-hidden border border-cyan-400/30 shadow-[0_0_30px_-10px_rgba(56,189,248,0.5)] transition-shadow duration-500 hover:shadow-[0_0_40px_-5px_rgba(56,189,248,0.6)]"
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover object-center"
              >
                <source src="/anna.mp4" type="video/mp4" />
              </video>

              {/* Fullscreen button */}
              <div className="absolute top-3 right-3 flex gap-2 z-10">
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-black/40 hover:bg-black/60 text-white rounded-full"
                  onClick={() => setIsFullscreen(true)}
                >
                  <Maximize2 className="w-5 h-5" />
            </Button>
              </div>
            </div>

            <p className="text-gray-400 text-xs mt-3 text-center">
              {t('landing.hero.videoDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Fullscreen player */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg aspect-[9/16] rounded-xl overflow-hidden border border-cyan-400/30 shadow-[0_0_50px_-10px_rgba(56,189,248,0.7)]">
            <video
              autoPlay
              controls
              playsInline
              className="w-full h-full object-cover object-center"
            >
              <source src="/anna.mp4" type="video/mp4" />
            </video>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(false)}
              className="absolute top-3 right-3 text-white bg-black/40 hover:bg-black/60 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};
