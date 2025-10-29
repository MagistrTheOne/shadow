"use client";

import {
  Bot,
  Video,
  MessageSquare,
  FileText,
  Brain,
  Shield,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export const FeaturesSection = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Bot,
      title: t('landing.features.aiAvatars.title'),
      description: t('landing.features.aiAvatars.desc'),
    },
    {
      icon: Video,
      title: t('landing.features.videoCalls.title'),
      description: t('landing.features.videoCalls.desc'),
    },
    {
      icon: MessageSquare,
      title: t('landing.features.chat.title'),
      description: t('landing.features.chat.desc'),
    },
    {
      icon: FileText,
      title: t('landing.features.transcripts.title'),
      description: t('landing.features.transcripts.desc'),
    },
    {
      icon: Brain,
      title: t('landing.features.insights.title'),
      description: t('landing.features.insights.desc'),
    },
    {
      icon: Shield,
      title: t('landing.features.security.title'),
      description: t('landing.features.security.desc'),
    },
  ];
  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-6">
            <Zap className="w-4 h-4 text-cyan-400 mr-2" />
            <span className="text-sm text-gray-300">{t('landing.features.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            {t('landing.features.title1')}{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              {t('landing.features.title2')}
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
            {t('landing.features.subtitle')}
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10
                         hover:border-cyan-400/40 transition-all duration-500
                         hover:shadow-[0_0_40px_-10px_rgba(56,189,248,0.5)]"
            >
              {/* glow ring behind icon */}
              <div className="absolute top-6 left-6 w-14 h-14 rounded-full bg-cyan-400/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative inline-flex items-center justify-center w-12 h-12 mb-6 rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 group-hover:scale-105 transition-transform">
                <feature.icon className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>

              {/* subtle overlay */}
              <div className="absolute inset-0 rounded-2xl bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-sm backdrop-blur-sm">
            {t('landing.features.trusted')}
          </div>
        </div>
      </div>
    </section>
  );
};
