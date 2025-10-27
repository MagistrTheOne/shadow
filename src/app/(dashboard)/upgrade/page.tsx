"use client";

import { SubscriptionStatus } from "@/modules/subscriptions/ui/components/subscription-status";
import { PricingView } from "@/modules/subscriptions/ui/views/pricing-view";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCardIcon, SettingsIcon } from "lucide-react";

const UpgradePage = () => {
  const { data: currentSubscription } = trpc.subscriptions.getCurrent.useQuery();

  return (
    <div className="py-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Subscription Management</h1>
          <p className="text-gray-400">Manage your subscription and billing settings</p>
        </div>

        <Tabs defaultValue="current" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/5">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              Current Plan
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <CreditCardIcon className="w-4 h-4" />
              Available Plans
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCardIcon className="w-4 h-4" />
              Billing History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <SubscriptionStatus />
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Plan Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentSubscription?.plan === "free" && (
                      <>
                        <p className="text-gray-400">You're on the Free plan. Upgrade to unlock:</p>
                        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                          <li>Unlimited meetings</li>
                          <li>Advanced AI summaries</li>
                          <li>Priority support</li>
                          <li>Custom AI agents</li>
                          <li>API access</li>
                        </ul>
                      </>
                    )}
                    {currentSubscription?.plan === "pro" && (
                      <>
                        <p className="text-gray-400">You're on the Pro plan. Enjoy:</p>
                        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                          <li>Everything in Free</li>
                          <li>50 meetings per month</li>
                          <li>100GB storage</li>
                          <li>Advanced AI features</li>
                          <li>Priority support</li>
                        </ul>
                      </>
                    )}
                    {currentSubscription?.plan === "enterprise" && (
                      <>
                        <p className="text-gray-400">You're on the Enterprise plan. Enjoy:</p>
                        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                          <li>Everything in Pro</li>
                          <li>Unlimited meetings</li>
                          <li>Unlimited storage</li>
                          <li>White-label solution</li>
                          <li>Dedicated support</li>
                          <li>SLA guarantee</li>
                        </ul>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="plans">
            <PricingView />
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-400">Billing history will be available here once you have active payments.</p>
                  <p className="text-sm text-gray-500 mt-2">Invoices and receipts will appear here automatically.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UpgradePage;
