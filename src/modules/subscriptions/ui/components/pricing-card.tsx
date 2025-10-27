"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "lucide-react";

interface PricingCardProps {
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
    features: string[];
    limits: {
      meetingsPerMonth: number;
      storageGB: number;
      transcriptWords: number;
    };
  };
  isPopular?: boolean;
  onSelect: (planId: string) => void;
  isLoading?: boolean;
  currentPlan?: string;
}

export const PricingCard = ({
  plan,
  isPopular = false,
  onSelect,
  isLoading = false,
  currentPlan,
}: PricingCardProps) => {
  const isCurrentPlan = currentPlan === plan.id;

  return (
    <Card
      className={`relative bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 ${
        isPopular ? "ring-2 ring-blue-500/50" : ""
      } ${isCurrentPlan ? "border-green-500/50" : ""}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-600 text-white px-3 py-1">Most Popular</Badge>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="secondary" className="bg-green-600 text-white px-3 py-1">
            Current
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-8">
        <CardTitle className="text-2xl text-white mb-2">{plan.name}</CardTitle>
        <div className="flex items-center justify-center">
          <span className="text-4xl font-bold text-white">${plan.price}</span>
          {plan.price > 0 && (
            <span className="text-gray-400 ml-2">/{plan.currency.toLowerCase()}/mo</span>
          )}
        </div>
        {plan.price === 0 && (
          <p className="text-gray-400 text-sm">Free forever</p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Features */}
        <div className="space-y-3">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-gray-300 text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* Limits */}
        <div className="border-t border-white/10 pt-6 space-y-3">
          <h4 className="text-white font-medium mb-3">Limits</h4>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Meetings per month</span>
              <span>{plan.limits.meetingsPerMonth === -1 ? "Unlimited" : plan.limits.meetingsPerMonth}</span>
            </div>
            <div className="flex justify-between">
              <span>Storage</span>
              <span>{plan.limits.storageGB === -1 ? "Unlimited" : `${plan.limits.storageGB}GB`}</span>
            </div>
            <div className="flex justify-between">
              <span>Transcript words</span>
              <span>{plan.limits.transcriptWords === -1 ? "Unlimited" : plan.limits.transcriptWords.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onSelect(plan.id)}
          disabled={isLoading || isCurrentPlan}
          className={`w-full mt-6 ${
            isPopular
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
          } ${isCurrentPlan ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isCurrentPlan
            ? "Current Plan"
            : plan.price === 0
            ? "Get Started Free"
            : `Choose ${plan.name}`}
        </Button>
      </CardContent>
    </Card>
  );
};
