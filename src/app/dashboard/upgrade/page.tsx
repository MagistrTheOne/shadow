"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Star, 
  Zap, 
  Crown,
  ArrowRight,
  Users,
  Video,
  Bot,
  Calendar,
  Shield,
  Headphones
} from "lucide-react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";

const PLANS = [
  {
    name: "Free",
    price: 0,
    period: "month",
    description: "Perfect for getting started",
    features: [
      "Up to 5 meetings per month",
      "Basic AI agent",
      "Standard video quality",
      "Community support",
      "Basic analytics"
    ],
    limitations: [
      "Limited to 30 minutes per meeting",
      "No screen sharing",
      "Basic AI capabilities"
    ],
    popular: false,
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
    disabled: true
  },
  {
    name: "Pro",
    price: 29,
    period: "month",
    description: "For growing teams",
    features: [
      "Unlimited meetings",
      "Advanced AI agents",
      "HD video quality",
      "Screen sharing",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
      "Meeting recordings"
    ],
    limitations: [],
    popular: true,
    buttonText: "Upgrade to Pro",
    buttonVariant: "default" as const,
    disabled: false
  },
  {
    name: "Enterprise",
    price: 99,
    period: "month",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Unlimited AI agents",
      "4K video quality",
      "Advanced security",
      "Dedicated support",
      "Custom integrations",
      "White-label solution",
      "SLA guarantee"
    ],
    limitations: [],
    popular: false,
    buttonText: "Contact Sales",
    buttonVariant: "default" as const,
    disabled: false
  }
];

export default function UpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: subscription, isLoading, isError } = trpc.subscriptions.getCurrent.useQuery();

  const createSubscription = trpc.subscriptions.create.useMutation({
    onSuccess: () => {
      toast.success("Subscription created successfully!");
      setIsProcessing(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create subscription");
      setIsProcessing(false);
    },
  });

  const handleUpgrade = (planName: string) => {
    if (planName === "Free") return;
    
    setIsProcessing(true);
    setSelectedPlan(planName);
    
    // Simulate payment processing
    setTimeout(() => {
      createSubscription.mutate({
        plan: planName.toLowerCase() as "free" | "pro" | "enterprise"
      });
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="py-6 px-4 md:px-8">
        <LoadingState
          title="Loading subscription..."
          description="Fetching your current plan"
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-6 px-4 md:px-8">
        <ErrorState
          title="Error loading subscription"
          description="Unable to fetch your subscription information. Please try refreshing the page."
        />
      </div>
    );
  }

  const currentPlan = subscription?.plan || "free";

  return (
    <div className="py-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Unlock the full potential of AI-powered meetings with our flexible pricing plans
          </p>
        </div>

        {/* Current Plan Status */}
        {subscription && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Crown className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      Current Plan: {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Status: <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                        {subscription.status}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">
                    ${subscription.plan === "free" ? 0 : subscription.plan === "pro" ? 29 : 99}/month
                  </p>
                  <p className="text-gray-400 text-sm">
                    Next billing: {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrentPlan = plan.name.toLowerCase() === currentPlan;
            const isProcessing = selectedPlan === plan.name && isProcessing;
            
            return (
              <Card 
                key={plan.name}
                className={`relative bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-200 ${
                  plan.popular ? "border-blue-400/50 ring-2 ring-blue-400/20" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {plan.name === "Free" && <Users className="w-6 h-6 text-gray-400" />}
                    {plan.name === "Pro" && <Zap className="w-6 h-6 text-blue-400" />}
                    {plan.name === "Enterprise" && <Crown className="w-6 h-6 text-purple-400" />}
                    <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                  </div>
                  <p className="text-gray-400">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Features */}
                  <div>
                    <h4 className="text-white font-semibold mb-3">Features</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-300">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="text-white font-semibold mb-3">Limitations</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-center gap-2 text-gray-400">
                            <div className="w-4 h-4 rounded-full bg-gray-600 flex-shrink-0"></div>
                            <span className="text-sm">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    className={`w-full ${
                      plan.buttonVariant === "default" 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "border-white/20 text-gray-300 hover:bg-white/10"
                    }`}
                    variant={plan.buttonVariant}
                    disabled={plan.disabled || isCurrentPlan || isProcessing}
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Current Plan
                      </>
                    ) : (
                      <>
                        {plan.buttonText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mt-12">
          <CardHeader>
            <CardTitle className="text-white text-center">Feature Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white py-3">Features</th>
                    <th className="text-center text-white py-3">Free</th>
                    <th className="text-center text-white py-3">Pro</th>
                    <th className="text-center text-white py-3">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {[
                    { feature: "Meetings per month", free: "5", pro: "Unlimited", enterprise: "Unlimited" },
                    { feature: "Meeting duration", free: "30 min", pro: "Unlimited", enterprise: "Unlimited" },
                    { feature: "AI Agents", free: "1 Basic", pro: "5 Advanced", enterprise: "Unlimited" },
                    { feature: "Video quality", free: "720p", pro: "1080p", enterprise: "4K" },
                    { feature: "Screen sharing", free: "❌", pro: "✅", enterprise: "✅" },
                    { feature: "Recording", free: "❌", pro: "✅", enterprise: "✅" },
                    { feature: "Support", free: "Community", pro: "Priority", enterprise: "Dedicated" },
                    { feature: "Custom branding", free: "❌", pro: "✅", enterprise: "✅" },
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="text-gray-300 py-3">{row.feature}</td>
                      <td className="text-center text-gray-400 py-3">{row.free}</td>
                      <td className="text-center text-blue-400 py-3">{row.pro}</td>
                      <td className="text-center text-purple-400 py-3">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mt-12">
          <CardHeader>
            <CardTitle className="text-white text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-white font-semibold mb-2">Can I change my plan anytime?</h4>
              <p className="text-gray-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Is there a free trial?</h4>
              <p className="text-gray-400">Yes, all paid plans come with a 14-day free trial. No credit card required.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-400">We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-400">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}