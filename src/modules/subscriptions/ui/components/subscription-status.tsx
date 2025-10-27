"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, CreditCardIcon, AlertTriangleIcon } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export const SubscriptionStatus = () => {
  const { data: subscription, isLoading } = trpc.subscriptions.getCurrent.useQuery();

  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/10 rounded w-1/4"></div>
            <div className="h-6 bg-white/10 rounded w-1/2"></div>
            <div className="h-4 bg-white/10 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default to free plan if no subscription
  const currentPlan = subscription?.plan || "free";
  const isActive = subscription?.status === "active" || currentPlan === "free";

  if (!isActive) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="w-5 h-5 text-yellow-400" />
            Subscription Inactive
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mb-4">
            Your {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan is inactive.
            Renew to continue using premium features.
          </p>
          <Button asChild>
            <Link href="/upgrade">Renew Plan</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isExpiringSoon = subscription?.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days

  const planName = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5 text-blue-400" />
            Current Plan
          </div>
          {currentPlan !== "free" && subscription && (
            <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
              {subscription.status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
        <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">{planName} Plan</span>
          <span className="text-gray-400">
            {currentPlan === "free" ? "Free" : `$${getPlanPrice(currentPlan)}/mo`}
          </span>
        </div>

        {subscription?.currentPeriodEnd && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Renews on
              </span>
              <span className={`font-medium ${isExpiringSoon ? "text-yellow-400" : "text-gray-300"}`}>
                {format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy")}
              </span>
            </div>

            {isExpiringSoon && (
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <AlertTriangleIcon className="w-4 h-4" />
                Expires soon - renew to continue service
              </div>
            )}
          </div>
        )}

        {/* Usage Progress - Mock data for now */}
        {currentPlan !== "free" && (
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h4 className="text-white font-medium">Usage This Month</h4>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Meetings</span>
                <span>2 / 50</span>
              </div>
              <Progress value={4} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage</span>
                <span>0.5 / 100 GB</span>
              </div>
              <Progress value={0.5} className="h-2" />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {currentPlan === "free" ? (
            <Button size="sm" asChild>
              <Link href="/pricing">Upgrade</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/upgrade">Manage Plan</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

function getPlanPrice(plan: string): number {
  const prices: Record<string, number> = {
    free: 0,
    pro: 29,
    enterprise: 99,
  };
  return prices[plan] || 0;
}
