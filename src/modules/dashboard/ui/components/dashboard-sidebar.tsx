"use client";
//ico(for our)
import { BotIcon, StarIcon, VideoIcon, ZapIcon, HomeIcon } from "lucide-react"
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


const firstSection = [
    {
        icon:VideoIcon,
        label:"Meetings",
        href:"/meetings",
    },
    {
        icon:BotIcon,
        label:"Agents",
        href:"/agents",
    }
];

const SecondSection = [
    {
        icon:StarIcon,
        label: "Upgrade",
        href: "/upgrade",
    },
 
];

export const DashboardSidebar = () => {
    const pathname =usePathname();



    return (
        <Sidebar className="bg-black/40 backdrop-blur-xl border-r border-white/10">
            <SidebarHeader className="text-white">
                <div className="flex items-center justify-between px-2 pt-2">
                    <Link href="/" className="flex items-center gap-2">
                     <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                         <ZapIcon className="w-5 h-5 text-white" />
                     </div>
                     <p className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Shadow.Ai</p>
                </Link>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10" asChild>
                        <Link href="/" title="Back to Home">
                            <HomeIcon className="w-4 h-4" />
                        </Link>
                    </Button>
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
                                "h-10 hover:bg-white/10 border border-transparent hover:border-white/20 text-white hover:text-white transition-all duration-200",
                                pathname === Item.href && "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-white/30 text-white"
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
                                pathname === Item.href && "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-white/30 text-white"
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