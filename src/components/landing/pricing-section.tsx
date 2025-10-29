"use client";

import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Rocket } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export const PricingSection = () => {
  const { t } = useLanguage();
  
  const plans = [
    {
      name: t('landing.pricing.starter.name'),
      price: t('landing.pricing.starter.price'),
      period: t('landing.pricing.starter.period'),
      description: t('landing.pricing.starter.desc'),
      icon: Zap,
      color: "text-gray-400",
      features: [
        t('landing.pricing.features.meetings5'),
        t('landing.pricing.features.basicAvatar'),
        t('landing.pricing.features.standardVideo'),
        t('landing.pricing.features.basicTranscripts'),
        t('landing.pricing.features.emailSupport')
      ],
      cta: t('landing.pricing.starter.cta'),
      popular: false
    },
    {
      name: t('landing.pricing.professional.name'),
      price: t('landing.pricing.professional.price'),
      period: t('landing.pricing.professional.period'),
      description: t('landing.pricing.professional.desc'),
      icon: Crown,
      color: "text-gray-300",
      features: [
        t('landing.pricing.features.unlimitedMeetings'),
        t('landing.pricing.features.advancedAvatars'),
        t('landing.pricing.features.hdVideo'),
        t('landing.pricing.features.smartTranscripts'),
        t('landing.pricing.features.aiInsights'),
        t('landing.pricing.features.prioritySupport'),
        t('landing.pricing.features.customBranding')
      ],
      cta: t('landing.pricing.professional.cta'),
      popular: true
    },
    {
      name: t('landing.pricing.enterprise.name'),
      price: t('landing.pricing.enterprise.price'),
      period: t('landing.pricing.enterprise.period'),
      description: t('landing.pricing.enterprise.desc'),
      icon: Rocket,
      color: "text-gray-300",
      features: [
        t('landing.pricing.features.everythingPro'),
        t('landing.pricing.features.customTraining'),
        t('landing.pricing.features.4kVideo'),
        t('landing.pricing.features.advancedAnalytics'),
        t('landing.pricing.features.sso'),
        t('landing.pricing.features.dedicatedSupport'),
        t('landing.pricing.features.customIntegrations'),
        t('landing.pricing.features.onPremise')
      ],
      cta: t('landing.pricing.enterprise.cta'),
      popular: false
    }
  ];
  return (
    <section id="pricing" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-6">
            <Crown className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-300">{t('landing.pricing.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            {t('landing.pricing.title1')}{" "}
            <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
              {t('landing.pricing.title2')}
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
            {t('landing.pricing.subtitle')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-3xl bg-white/5 backdrop-blur-sm transition-all duration-300 hover:transform hover:scale-105 ${
                plan.popular
                  ? "bg-white/10"
                  : ""
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm font-semibold">
                    {t('landing.pricing.popular')}
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
                  <plan.icon className={`w-8 h-8 ${plan.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-2">/{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button - Временно закомментировано */}
              {/* <Button
                className={`w-full py-3 text-sm sm:text-base md:text-lg font-semibold ${
                  plan.popular
                    ? "bg-white/20 hover:bg-white/30 text-white"
                    : "bg-white/10 hover:bg-white/30 text-white"
                }`}
              >
                <span className="truncate">{plan.cta}</span>
              </Button> */}
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">
            {t('landing.pricing.trial')}
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <span>{t('landing.pricing.compliance')}</span>
            <span>{t('landing.pricing.gdpr')}</span>
            <span>{t('landing.pricing.uptime')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
