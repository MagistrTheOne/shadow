"use client";
//ico(for our)
import { BotIcon, StarIcon, VideoIcon } from "lucide-react"
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
        <Sidebar>
            <SidebarHeader className="text-sidebar-accent-foreground">
                <Link href="/" className="flex items-center gap-2 px-2 pt-2">
                     <Image src="/logo.svg" height={36} width={36} alt="Shadow"/>
                     <p className="text-2xl font-semibold">Shadow.Ai</p>
                </Link>
            </SidebarHeader>
            <div className="px-4 py-2">
                <Separator className="opacity-10 text-[#5D6B68]"/>
            </div>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {firstSection.map((Item) => 
                            <SidebarMenuItem key={Item.href}>
                            <SidebarMenuButton 
                            asChild
                            className= {cn
                                (
                                "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#5D6B68]/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                                pathname === Item.href && "bg-linear-to-r/oklch border-[#5D6B68]/10"
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
            <Separator className="opacity-10 text-[#5D6B68]"/>
            </div>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {SecondSection.map((Item) => 
                            <SidebarMenuItem key={Item.href}>
                            <SidebarMenuButton 
                            asChild
                            className= {cn
                                (
                                "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#5D6B68]/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                                pathname === Item.href && "bg-linear-to-r/oklch border-[#5D6B68]/10"
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