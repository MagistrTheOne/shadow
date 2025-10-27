"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, Loader2 } from "lucide-react";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

interface PricingPlan {
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
}

export const PricingView = () => {
  const { data: plans, isLoading, isError, error } = trpc.subscriptions.getPlans.useQuery();
  const createSubscriptionMutation = trpc.subscriptions.create.useMutation({
    onSuccess: () => {
      toast.success("Subscription created successfully!");
      // Redirect to dashboard or payment
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      toast.error("Failed to create subscription", {
        description: error.message,
      });
    },
  });

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  if (isLoading) return <LoadingState title="Loading pricing plans..." description="Fetching subscription options." />;
  if (isError) return <ErrorState title="Error loading pricing" description={error?.message || "Something went wrong."} />;

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    try {
      await createSubscriptionMutation.mutateAsync({ plan: planId as any });
    } catch (error) {
      // Error handled by mutation
    } finally {
      setSelectedPlan(null);
    }
  };

  return (
    <div className="py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Select the perfect plan for your AI-powered meeting needs. Upgrade or downgrade at any time.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans?.map((plan: PricingPlan) => (
            <Card
              key={plan.id}
              className={`relative bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 ${
                plan.id === "pro" ? "ring-2 ring-blue-500/50" : ""
              }`}
            >
              {plan.id === "pro" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-3 py-1">Most Popular</Badge>
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
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={createSubscriptionMutation.isPending}
                  className={`w-full mt-6 ${
                    plan.id === "pro"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
                  }`}
                >
                  {createSubscriptionMutation.isPending && selectedPlan === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : plan.price === 0 ? (
                    "Get Started Free"
                  ) : (
                    `Choose ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">
            Need a custom plan for your enterprise?{" "}
            <Link href="/contact" className="text-blue-400 hover:text-blue-300">
              Contact us
            </Link>
          </p>
          <p className="text-sm text-gray-500">
            All plans include 14-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
};
