"use client";

import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Rocket } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for individuals and small teams",
    icon: Zap,
    color: "text-gray-400",
    features: [
      "Up to 5 meetings per month",
      "Basic AI avatar",
      "Standard video quality",
      "Basic transcripts",
      "Email support"
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Professional",
    price: "$29",
    period: "per month",
    description: "Best for growing teams and businesses",
    icon: Crown,
    color: "text-gray-300",
    features: [
      "Unlimited meetings",
      "Advanced AI avatars",
      "HD video quality",
      "Smart transcripts & summaries",
      "AI-powered insights",
      "Priority support",
      "Custom branding"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For large organizations with advanced needs",
    icon: Rocket,
    color: "text-gray-300",
    features: [
      "Everything in Professional",
      "Custom AI avatar training",
      "4K video quality",
      "Advanced analytics",
      "SSO integration",
      "Dedicated support",
      "Custom integrations",
      "On-premise deployment"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-6">
            <Crown className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-300">Pricing</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose your{" "}
            <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
              perfect plan
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Start free and scale as you grow. All plans include our enterprise AI avatar technology
            and premium meeting features.
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
                    Most Popular
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

              {/* CTA Button */}
              <Button
                className={`w-full py-3 text-lg font-semibold ${
                  plan.popular
                    ? "bg-white/20 hover:bg-white/30 text-white"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">
            All plans include 14-day free trial • No credit card required • Cancel anytime
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <span>✓ SOC 2 Compliant</span>
            <span>✓ GDPR Ready</span>
            <span>✓ 99.9% Uptime SLA</span>
          </div>
        </div>
      </div>
    </section>
  );
};
