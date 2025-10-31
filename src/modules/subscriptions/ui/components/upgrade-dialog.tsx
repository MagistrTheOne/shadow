"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
}

export const UpgradeDialog = ({ isOpen, onClose, currentPlan }: UpgradeDialogProps) => {
  const router = useRouter();
  const { data: plans } = trpc.subscriptions.getPlans.useQuery();
  const createSubscriptionMutation = trpc.subscriptions.create.useMutation({
    onSuccess: () => {
      toast.success("Plan upgraded successfully!");
      onClose();
      router.refresh();
    },
    onError: (error) => {
      toast.error("Failed to upgrade plan", {
        description: error.message,
      });
    },
  });

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setSelectedPlan(planId);
    try {
      await createSubscriptionMutation.mutateAsync({ plan: planId as any });
    } catch (error) {
      // Error handled by mutation
    } finally {
      setSelectedPlan(null);
    }
  };

  const availablePlans = plans?.filter(plan => plan.id !== currentPlan) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Choose a plan that fits your needs. You can change or cancel anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {availablePlans.map((plan) => (
            <div
              key={plan.id}
              className="border border-white/10 rounded-lg p-6 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white">${plan.price}</span>
                    {plan.price > 0 && (
                      <span className="text-gray-400">/{plan.currency.toLowerCase()}/month</span>
                    )}
                  </div>
                </div>
                {plan.id === "pro" && (
                  <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  <div className="space-y-1">
                    <div>Meetings: {plan.limits.meetingsPerMonth === -1 ? "Unlimited" : plan.limits.meetingsPerMonth}/month</div>
                    <div>Storage: {plan.limits.storageGB === -1 ? "Unlimited" : `${plan.limits.storageGB}GB`}</div>
                  </div>
                </div>
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={createSubscriptionMutation.isPending}
                  className={plan.id === "pro" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {createSubscriptionMutation.isPending && selectedPlan === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Upgrading...
                    </>
                  ) : (
                    `Choose ${plan.name}`
                  )}
                </Button>
              </div>
            </div>
          ))}

          <div className="text-center text-sm text-gray-400 pt-4 border-t border-white/10">
            Need a custom plan? <a href="/contact" className="text-blue-400 hover:text-blue-300">Contact us</a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
