"use client";
//ico(for our)
import { BotIcon, StarIcon, VideoIcon, ZapIcon, HomeIcon, PlusIcon } from "lucide-react"
//server
import Link from "next/link";
import Image from "next/image";
//components ui from component(shadn)
import { Sidebar,SidebarContent,SidebarGroup,SidebarGroupContent,SidebarHeader,SidebarMenu,SidebarMenuButton,SidebarMenuItem,SidebarFooter } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator";
import { Item } from "@radix-ui/react-accordion";
import { cn } from './../../../../lib/utils';
import { usePathname, } from "next/navigation";
import { DashboardUserButton } from "./dashboard-user-button";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { useState } from "react";
import { useSidebarState } from "@/stores/dashboard-store";


const firstSection = [
    {
        icon:VideoIcon,
        label:"Meetings",
        href:"/dashboard/meetings",
    },
    {
        icon:BotIcon,
        label:"Agents",
        href:"/dashboard/agents",
    }
];

const SecondSection = [
    {
        icon:StarIcon,
        label: "Upgrade",
        href: "/dashboard/upgrade",
    },
 
];

export const DashboardSidebar = () => {
    const pathname = usePathname();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const { sidebarOpen, setSidebarOpen } = useSidebarState();
    
    // Fetch data for counters
    const { data: meetings, isLoading: meetingsLoading } = trpc.meetings.getMany.useQuery({});
    const { data: agents, isLoading: agentsLoading } = trpc.agents.getMany.useQuery(undefined);
    const { data: subscription, isLoading: subscriptionLoading } = trpc.subscriptions.getCurrent.useQuery();

    const getCount = (type: 'meetings' | 'agents') => {
        if (type === 'meetings') return meetingsLoading ? '...' : (meetings?.length || 0);
        if (type === 'agents') return agentsLoading ? '...' : (agents?.length || 0);
        return 0;
    };

    const getSubscriptionBadge = () => {
        if (subscriptionLoading) return { text: 'Loading...', color: 'text-gray-400' };
        if (!subscription) return { text: 'Free', color: 'text-gray-400' };
        return {
            text: subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1),
            color: subscription.plan === 'pro' ? 'text-blue-400' : subscription.plan === 'enterprise' ? 'text-purple-400' : 'text-gray-400'
        };
    };



    return (
        <Sidebar className="bg-black/40 backdrop-blur-xl border-r border-white/10">
            <SidebarHeader className="text-white">
                <div className="flex items-center justify-between px-2 pt-2">
                    <Link href="/" className="flex items-center gap-2">
                     <div className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                         <ZapIcon className="w-5 h-5 text-white" />
                     </div>
                     <p className="text-2xl font-semibold text-white">Shadow.Ai</p>
                </Link>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10" asChild>
                        <Link href="/" title="Back to Home">
                            <HomeIcon className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>
                
                {/* Subscription Status */}
                <div className="px-2 pt-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Plan</span>
                        <span className={`text-xs font-medium ${getSubscriptionBadge().color}`}>
                            {getSubscriptionBadge().text}
                        </span>
                    </div>
                </div>
            </SidebarHeader>
            <div className="px-4 py-2">
                <Separator className="opacity-20 bg-white/20"/>
            </div>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {firstSection.map((Item) => 
                            <SidebarMenuItem key={Item.href}>
                            <SidebarMenuButton 
                            asChild
                            className= {cn(
                                "h-10 hover:bg-white/10 border border-transparent hover:border-white/20 text-white hover:text-white transition-all duration-200 group",
                                pathname === Item.href && "bg-white/20 border-white/30 text-white"
                            )}
                                isActive ={pathname === Item.href}
                                onMouseEnter={() => setHoveredItem(Item.href)}
                                onMouseLeave={() => setHoveredItem(null)}
                                >  
                                <Link href={Item.href}>
                                <Item.icon className="size-5"/>
                                <span className="text-sm font-medium tracking-tight">
                                    {Item.label}
                                </span>
                                {hoveredItem === Item.href && (
                                    <span className="ml-auto text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {getCount(Item.href === '/meetings' ? 'meetings' : 'agents')}
                                    </span>
                                )}
                                </Link>
                            </SidebarMenuButton>
                            </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                        
                        {/* Quick Actions */}
                        <div className="px-2 py-2">
                            <div className="space-y-1">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
                                    asChild
                                >
                                    <Link href="/dashboard/meetings/new">
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        New Meeting
                                    </Link>
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
                                    asChild
                                >
                                    <Link href="/dashboard/agents/new">
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        New Agent
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </SidebarGroupContent>
            <div className="px-4 py-2">
            <Separator className="opacity-20 bg-white/20"/>
            </div>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {SecondSection.map((Item) => 
                            <SidebarMenuItem key={Item.href}>
                            <SidebarMenuButton 
                            asChild
                            className= {cn(
                                "h-10 hover:bg-white/10 border border-transparent hover:border-white/20 text-white hover:text-white transition-all duration-200",
                                pathname === Item.href && "bg-white/20 border-white/30 text-white"
                            )}
                                isActive ={pathname === Item.href}
                                >  
                                <Link href={Item.href}>
                                <Item.icon className="size-5"/>
                                <span className="text-sm font-medium tracking-tight">
                                    {Item.label}
                                </span>
                                </Link>
                            </SidebarMenuButton>
                            </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="text-white">
                <DashboardUserButton/>
            </SidebarFooter>
        </Sidebar>
    )
};