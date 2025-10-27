"use client";

import { Bot, Video, MessageSquare, FileText, Brain, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Avatars",
    description: "Sophisticated avatars that understand context and respond naturally to your meetings.",
    color: "text-gray-400"
  },
  {
    icon: Video,
    title: "Premium Video Calls",
    description: "Crystal clear video quality with advanced noise cancellation and background effects.",
    color: "text-gray-400"
  },
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    description: "Instant messaging during meetings with AI-powered suggestions and translations.",
    color: "text-gray-400"
  },
  {
    icon: FileText,
    title: "Smart Transcripts",
    description: "Automatic transcription with AI-powered summaries and action item extraction.",
    color: "text-gray-400"
  },
  {
    icon: Brain,
    title: "AI Insights",
    description: "Get intelligent insights, sentiment analysis, and meeting effectiveness metrics.",
    color: "text-gray-400"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption, SOC 2 compliance, and advanced privacy controls.",
    color: "text-gray-400"
  }
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
            <Zap className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-300">Product Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything you need for{" "}
            <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
              professional meetings
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience enterprise-grade video conferencing with sophisticated AI avatars,
            intelligent automation, and seamless collaboration tools.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
            <span className="text-gray-300">Trusted by enterprise teams worldwide</span>
          </div>
        </div>
      </div>
    </section>
  );
};
