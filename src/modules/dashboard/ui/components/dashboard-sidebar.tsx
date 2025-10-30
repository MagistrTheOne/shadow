"use client";

import {
  BotIcon,
  StarIcon,
  VideoIcon,
  ZapIcon,
  HomeIcon,
  PlusIcon,
  MessageSquareIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DashboardUserButton } from "./dashboard-user-button";
import { trpc } from "@/trpc/client";
import { useState } from "react";
import { useSidebarState } from "@/stores/dashboard-store";

const firstSection = [
  { icon: VideoIcon, label: "Meetings", href: "/dashboard/meetings" },
  { icon: BotIcon, label: "Agents", href: "/dashboard/agents" },
  { icon: MessageSquareIcon, label: "Chats", href: "/dashboard/chats" },
  { icon: UsersIcon, label: "Friends", href: "/dashboard/friends" },
];

const annaSection = [
  { icon: BotIcon, label: "ANNA", href: "/dashboard/anna", isSpecial: true },
];

const secondSection = [
  { icon: StarIcon, label: "Upgrade", href: "/dashboard/upgrade" },
];

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { sidebarOpen } = useSidebarState();

  const { data: meetings, isLoading: meetingsLoading } =
    trpc.meetings.getMany.useQuery({});
  const { data: agents, isLoading: agentsLoading } =
    trpc.agents.getMany.useQuery(undefined);
  const { data: subscription, isLoading: subscriptionLoading } =
    trpc.subscriptions.getCurrent.useQuery();

  const getCount = (type: "meetings" | "agents") => {
    if (type === "meetings")
      return meetingsLoading ? "..." : meetings?.length || 0;
    if (type === "agents") return agentsLoading ? "..." : agents?.length || 0;
    return 0;
  };

  const getSubscriptionBadge = () => {
    if (subscriptionLoading)
      return { text: "Loading...", color: "text-gray-400" };
    if (!subscription) return { text: "Free", color: "text-gray-400" };
    return {
      text:
        subscription.plan.charAt(0).toUpperCase() +
        subscription.plan.slice(1),
      color:
        subscription.plan === "pro"
          ? "text-indigo-400"
          : subscription.plan === "enterprise"
          ? "text-violet-400"
          : "text-gray-400",
    };
  };

  return (
    <Sidebar className="bg-[#121214]/70 backdrop-blur-2xl border-r border-white/10 text-white shadow-[inset_0_0_30px_rgba(255,255,255,0.03)]">
      {/* Header */}
      <SidebarHeader>
        <div className="flex items-center justify-between px-3 pt-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-slate-400/30 shadow-[0_0_20px_-5px_rgba(148,163,184,0.4)] group-hover:shadow-[0_0_30px_-5px_rgba(148,163,184,0.6)] transition-all">
              <ZapIcon className="w-5 h-5 text-slate-200" />
            </div>
            <p className="text-xl font-semibold tracking-tight text-slate-100">
              Shadow.AI
            </p>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-white/10"
            asChild
          >
            <Link href="/" title="Back to Home">
              <HomeIcon className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Plan badge */}
        <div className="px-3 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Plan</span>
            <span className={cn("font-medium", getSubscriptionBadge().color)}>
              {getSubscriptionBadge().text}
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Separator */}
      <div className="px-4 py-2">
        <Separator className="opacity-20 bg-white/20" />
      </div>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {firstSection.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      "h-10 flex items-center gap-2 border border-transparent hover:border-slate-400/20 text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200 group rounded-lg",
                      pathname === item.href &&
                        "bg-slate-400/10 border-slate-400/30 text-white shadow-[0_0_15px_rgba(148,163,184,0.25)]"
                    )}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-5" />
                      <span className="text-sm font-medium">
                        {item.label}
                      </span>
                      {hoveredItem === item.href && (
                        <span className="ml-auto text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {getCount(
                            item.href.includes("meetings")
                              ? "meetings"
                              : "agents"
                          )}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ANNA Special Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {annaSection.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      "h-10 flex items-center gap-2 border border-transparent hover:border-violet-400/20 text-white/80 hover:text-white hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-slate-500/10 transition-all duration-200 group rounded-lg",
                      pathname === item.href &&
                        "bg-gradient-to-r from-violet-500/15 to-slate-500/15 border-violet-400/20 text-violet-200 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                    )}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-5" />
                      <span className="text-sm font-medium">
                        {item.label}
                      </span>
                      <Badge
                        variant="secondary"
                        className="ml-auto text-xs bg-violet-500/10 text-violet-300 border-violet-400/30"
                      >
                        AI
                      </Badge>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick actions */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 py-3 space-y-1">
              {[{ href: "/dashboard/meetings/new", label: "New Meeting" },
                { href: "/dashboard/agents/new", label: "New Agent" }].map(
                (action, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10 rounded-md"
                    asChild
                  >
                    <Link href={action.href}>
                      <PlusIcon className="w-4 h-4 mr-2" />
                      {action.label}
                    </Link>
                  </Button>
                )
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="px-4 py-2">
          <Separator className="opacity-20 bg-white/20" />
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondSection.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      "h-10 hover:bg-white/5 hover:border-slate-400/20 border border-transparent text-white/80 hover:text-white transition-all duration-200 rounded-lg",
                      pathname === item.href &&
                        "bg-slate-400/10 border-slate-400/30 text-white shadow-[0_0_15px_rgba(148,163,184,0.25)]"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-5" />
                      <span className="text-sm font-medium tracking-tight">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="text-white border-t border-white/10 bg-white/5 backdrop-blur-md">
        <DashboardUserButton />
      </SidebarFooter>
    </Sidebar>
  );
};
