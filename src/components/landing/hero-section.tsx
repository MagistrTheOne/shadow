"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-8">
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
            <Button size="lg" className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 text-lg px-8 py-4" asChild>
            <Link href="/sign-up">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/20 text-black hover:bg-white/10 text-lg px-8 py-4"
            >
              View Enterprise Demo
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
};