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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { ChevronDownIcon, CreditCardIcon, LogOutIcon, User, Settings, Users, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

export const DashboardUserButton = () => {
    
    const router = useRouter()
    const isMobile = useIsMobile();
    const { data, isPending } = authClient.useSession();
    
    // Get user profile and notifications
    const { data: profile } = trpc.users.getCurrentProfile.useQuery();
    const { data: unreadCount } = trpc.notifications.getUnreadCount.useQuery();

    // Update status mutation
    const updateStatus = trpc.users.updateStatus.useMutation({
        onSuccess: () => {
            toast.success("Status updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update status");
        },
    });

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

    const handleStatusChange = (status: string) => {
        updateStatus.mutate({
            status: status as any,
            richPresence: profile?.richPresence,
        });
    };


    if (isPending || !data?.user) {
        return null;
    }
    if (isMobile) {
        return(
            <Drawer>
                <DrawerTrigger className="flex w-full items-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-3 hover:bg-white/10 overflow-hidden" >
                 {profile?.avatarUrl ? (
                    <Avatar>
                        <AvatarImage src={profile.avatarUrl} />
                    </Avatar>
                ) : data.user.image ? (
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
                    <p className="w-full truncate text-sm font-medium text-white">
                        {profile?.displayName || data.user.name}
                    </p>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            {profile?.status || "offline"}
                        </Badge>
                        {unreadCount && unreadCount.count > 0 && (
                            <Badge className="bg-red-500 text-white text-xs">
                                {unreadCount.count}
                            </Badge>
                        )}
                    </div>
                </div>
                <ChevronDownIcon className="size-4 shrink-0 text-gray-400" />
                </DrawerTrigger>
                <DrawerContent className="bg-black/95 backdrop-blur-xl border-white/10">
                    <DrawerHeader>
                        <DrawerTitle className="text-white">
                            {profile?.displayName || data.user.name}
                        </DrawerTitle>
                        <DrawerDescription className="text-gray-400">
                            {data.user.email}
                        </DrawerDescription>
                        {profile?.customStatus && (
                            <p className="text-gray-300 text-sm">{profile.customStatus}</p>
                        )}
                    </DrawerHeader>
                    <div className="px-4 space-y-4">
                        {/* Status Selector */}
                        <div className="space-y-2">
                            <label className="text-white text-sm font-medium">Status</label>
                            <Select
                                value={profile?.status || "offline"}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-700">
                                    <SelectItem value="online" className="text-white">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                                            Online
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="dnd" className="text-white">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                                            Do Not Disturb
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="away" className="text-white">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                            Away
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="invisible" className="text-white">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-gray-500 rounded-full" />
                                            Invisible
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DrawerFooter>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/dashboard/profile/" + data.user.id)}
                            className="border-white/20 text-gray-300 hover:bg-white/10"
                        >
                            <User className="size-4 mr-2"/>
                            Profile
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/dashboard/friends")}
                            className="border-white/20 text-gray-300 hover:bg-white/10"
                        >
                            <Users className="size-4 mr-2"/>
                            Friends
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/upgrade")}
                            className="border-white/20 text-gray-300 hover:bg-white/10"
                        >
                        <CreditCardIcon className="size-4"/>
                         Billing
                        </Button>
                         <Button
                        variant="outline"
                        onClick={onLogout}
                        className="border-red-500/20 text-red-400 hover:bg-red-500/20"
                        >
                        <LogOutIcon className="size-4"/>
                         Logout
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        )
    }



    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-3 hover:bg-white/10 overflow-hidden">
                {profile?.avatarUrl ? (
                    <Avatar>
                        <AvatarImage src={profile.avatarUrl} />
                    </Avatar>
                ) : data.user.image ? (
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
                    <p className="w-full truncate text-sm font-medium text-white">
                        {profile?.displayName || data.user.name}
                    </p>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            {profile?.status || "offline"}
                        </Badge>
                        {unreadCount && unreadCount.count > 0 && (
                            <Badge className="bg-red-500 text-white text-xs">
                                {unreadCount.count}
                            </Badge>
                        )}
                    </div>
                </div>
                <ChevronDownIcon className="size-4 shrink-0 text-gray-400" />
            </DropdownMenuTrigger>

            {/* Dark glass dropdown */}
            <DropdownMenuContent
                align="end"
                side="right"
                className="w-72 rounded-xl border border-white/10 bg-black/60 backdrop-blur-lg shadow-2xl p-1 animate-fade-slide"
            >
                {/* User info */}
                <DropdownMenuLabel className="flex items-center gap-3 px-3 py-2">
                    {profile?.avatarUrl ? (
                        <Avatar>
                            <AvatarImage src={profile.avatarUrl} />
                        </Avatar>
                    ) : data.user.image ? (
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
                            {profile?.displayName || data.user.name}
                        </span>
                        <span className="truncate text-sm font-normal text-gray-400">
                            {data.user.email}
                        </span>
                        {profile?.customStatus && (
                            <span className="truncate text-xs text-gray-300">
                                {profile.customStatus}
                            </span>
                        )}
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-1 bg-white/10" />

                {/* Status Selector */}
                <div className="px-3 py-2">
                    <label className="text-white text-xs font-medium mb-2 block">Status</label>
                    <Select
                        value={profile?.status || "offline"}
                        onValueChange={handleStatusChange}
                    >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700">
                            <SelectItem value="online" className="text-white">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    Online
                                </div>
                            </SelectItem>
                            <SelectItem value="dnd" className="text-white">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                                    Do Not Disturb
                                </div>
                            </SelectItem>
                            <SelectItem value="away" className="text-white">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                    Away
                                </div>
                            </SelectItem>
                            <SelectItem value="invisible" className="text-white">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full" />
                                    Invisible
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <DropdownMenuSeparator className="my-1 bg-white/10" />

                {/* Profile */}
                <DropdownMenuItem 
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-md cursor-pointer transition-colors"
                    onClick={() => router.push("/dashboard/profile/" + data.user.id)}
                >
                    <User className="size-4 text-gray-400" />
                    <span className="flex-1">Profile</span>
                </DropdownMenuItem>

                {/* Friends */}
                <DropdownMenuItem 
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-md cursor-pointer transition-colors"
                    onClick={() => router.push("/dashboard/friends")}
                >
                    <Users className="size-4 text-gray-400" />
                    <span className="flex-1">Friends</span>
                    {unreadCount && unreadCount.count > 0 && (
                        <Badge className="bg-red-500 text-white text-xs">
                            {unreadCount.count}
                        </Badge>
                    )}
                </DropdownMenuItem>

                {/* Notifications */}
                <DropdownMenuItem 
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-md cursor-pointer transition-colors"
                    onClick={() => router.push("/dashboard/notifications")}
                >
                    <Bell className="size-4 text-gray-400" />
                    <span className="flex-1">Notifications</span>
                    {unreadCount && unreadCount.count > 0 && (
                        <Badge className="bg-red-500 text-white text-xs">
                            {unreadCount.count}
                        </Badge>
                    )}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 bg-white/10" />

                {/* Billing */}
                <DropdownMenuItem 
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-md cursor-pointer transition-colors"
                    onClick={() => router.push("/upgrade")}
                >
                    <CreditCardIcon className="size-4 text-gray-400" />
                    <span className="flex-1">Billing</span>
                </DropdownMenuItem>

                {/* Logout */}
                <DropdownMenuItem
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-md cursor-pointer transition-colors">
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
