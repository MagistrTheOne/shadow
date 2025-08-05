"use client";

import { GeneratedAvatar } from "@/components/generate-avatar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@radix-ui/react-dropdown-menu";
import{ Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
 } from "@/components/ui/drawer";

import { ChevronDownIcon, CreditCardIcon, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

export const DashboardUserButton = () => {
    
    const router = useRouter()
    const isMobile = useIsMobile();
    const { data, isPending } = authClient.useSession();
    

    //Logout system
    const onLogout = () => {
          authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/sign-in");
                }
            }
        })
    }


    if (isPending || !data?.user) {
        return null;
    }
    if (isMobile) {
        return(
            <Drawer>
                <DrawerTrigger className="flex w-full items-center rounded-lg border border-border/10 bg-white/5 p-3 hover:bg-white/10 overflow-hidden" >
                 {data.user.image ? (
                    <Avatar>
                        <AvatarImage src={data.user.image} />
                    </Avatar>
                ) : (
                    <GeneratedAvatar
                        seed={data.user.name}
                        variant="initials"
                        className="size-9"
                    />
                )}
                <div className="ml-3 flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden text-left">
                    <p className="w-full truncate text-sm font-medium">
                        {data.user.name}
                    </p>
                    <p className="w-full truncate text-xs text-muted-foreground">
                        {data.user.email}
                    </p>
                </div>
                <ChevronDownIcon className="size-4 shrink-0" />
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>
                            {data.user.name}
                        </DrawerTitle>
                        <DrawerDescription>
                            {data.user.email}
                        </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                        <Button
                        variant="outline"
                        onClick={() =>{}}
                        >
                        <CreditCardIcon className=" size-4 text-black"/>
                         Billing
                        </Button>
                         <Button
                        variant="outline"
                        onClick={onLogout}
                        >
                        <LogOutIcon className=" size-4 text-black"/>
                         Logout
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        )
    }



    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center rounded-lg border border-border/10 bg-white/5 p-3 hover:bg-white/10 overflow-hidden">
                {data.user.image ? (
                    <Avatar>
                        <AvatarImage src={data.user.image} />
                    </Avatar>
                ) : (
                    <GeneratedAvatar
                        seed={data.user.name}
                        variant="initials"
                        className="size-9"
                    />
                )}
                <div className="ml-3 flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden text-left">
                    <p className="w-full truncate text-sm font-medium">
                        {data.user.name}
                    </p>
                    <p className="w-full truncate text-xs text-muted-foreground">
                        {data.user.email}
                    </p>
                </div>
                <ChevronDownIcon className="size-4 shrink-0" />
            </DropdownMenuTrigger>

            {/* Dark glass dropdown */}
            <DropdownMenuContent
                align="end"
                side="right"
                className="w-72 rounded-xl border border-white/10 bg-[rgba(7,7,7,0.8)] backdrop-blur-lg shadow-2xl p-1 animate-fade-slide"
            >
                {/* User info */}
                <DropdownMenuLabel className="flex items-center gap-3 px-3 py-2">
                    {data.user.image ? (
                        <Avatar>
                            <AvatarImage src={data.user.image} />
                        </Avatar>
                    ) : (
                        <GeneratedAvatar
                            seed={data.user.name}
                            variant="initials"
                            className="size-9"
                        />
                    )}
                    <div className="flex flex-col overflow-hidden">
                        <span className="truncate font-medium text-white">
                            {data.user.name}
                        </span>
                        <span className="truncate text-sm font-normal text-gray-400">
                            {data.user.email}
                        </span>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-1 bg-white/10" />

                {/* Billing */}
                <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-white/5 hover:text-white rounded-md cursor-pointer transition-colors">
                    <CreditCardIcon className="size-4 text-gray-400" />
                    <span className="flex-1">Billing</span>
                </DropdownMenuItem>

                {/* Logout */}
                <DropdownMenuItem 
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-md cursor-pointer transition-colors">
                    <LogOutIcon className="size-4" />
                    <span className="flex-1">Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>

            {/* Animation */}
            <style jsx global>{`
                @keyframes fadeSlide {
                    0% {
                        opacity: 0;
                        transform: translateY(-4px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-slide {
                    animation: fadeSlide 0.15s ease-out;
                }
            `}</style>
        </DropdownMenu>
    );
};
