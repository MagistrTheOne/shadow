"use client";

import { useEffect } from "react";
import { GeneratedAvatar } from "@/components/generate-avatar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDownIcon,
  CreditCardIcon,
  LogOutIcon,
  User,
  Users,
  Bell,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUserPresence } from "@/stores/dashboard-store";

export const DashboardUserButton = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { data, isPending } = authClient.useSession();
  const { data: profile } = trpc.users.getCurrentProfile.useQuery();
  const { data: unreadCount } = trpc.notifications.getUnreadCount.useQuery();

  const { userPresence, setUserStatus, setCustomStatus, setRichPresence } = useUserPresence();

  const updateStatus = trpc.users.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      if (profile) {
        setUserStatus(profile.status as any);
        setCustomStatus(profile.customStatus || '');
      }
    },
    onError: (error: any) => toast.error(error.message || "Failed to update status"),
  });

  const onLogout = () => authClient.signOut({ fetchOptions: { onSuccess: () => router.push("/sign-in") } });

  const handleStatusChange = (status: string) => {
    setUserStatus(status as any);
    updateStatus.mutate({ status: status as any, richPresence: userPresence.richPresence });
  };

  useEffect(() => {
    if (profile) {
      setUserStatus(profile.status as any);
      setCustomStatus(profile.customStatus || '');
    }
  }, [profile, setUserStatus, setCustomStatus, setRichPresence]);

  if (isPending || !data?.user) return null;

  const statusOptions = [
    { value: "online", color: "bg-green-500", label: "Online" },
    { value: "dnd", color: "bg-red-500", label: "Do Not Disturb" },
    { value: "away", color: "bg-yellow-500", label: "Away" },
    { value: "invisible", color: "bg-gray-500", label: "Invisible" },
  ];

  const renderStatusSelect = (className?: string) => (
    <Select value={userPresence.status || "offline"} onValueChange={handleStatusChange}>
      <SelectTrigger className={cn("bg-white/10 border-white/20 text-white h-8", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-gray-900 border-gray-700">
        {statusOptions.map(({ value, color, label }) => (
          <SelectItem key={value} value={value} className="text-white">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              {label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const renderAvatar = () => (
    <div className="relative">
      {profile?.avatarUrl || data.user.image ? (
        <Avatar>
          <AvatarImage src={profile?.avatarUrl || data.user.image!} />
        </Avatar>
      ) : (
        <GeneratedAvatar seed={data.user.name} variant="initials" className="size-9" />
      )}
      <span
        className={cn(
          "absolute bottom-0 right-0 w-3 h-3 rounded-full border border-black",
          userPresence.status === "online" && "bg-green-500",
          userPresence.status === "dnd" && "bg-red-500",
          userPresence.status === "away" && "bg-yellow-500",
          userPresence.status === "invisible" && "bg-gray-500"
        )}
      />
    </div>
  );

  const commonMenuItems = [
    { label: "Profile", icon: User, href: "/dashboard/profile/" },
    { label: "Friends", icon: Users, href: "/dashboard/friends" },
    { label: "Notifications", icon: Bell, href: "/dashboard/notifications" },
    { label: "Billing", icon: CreditCardIcon, href: "/upgrade" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-3 hover:bg-cyan-400/10 hover:border-cyan-400/20 overflow-hidden transition-all">
        {renderAvatar()}
        <div className="ml-3 flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden text-left">
          <p className="truncate text-sm font-medium text-white">{profile?.displayName || data.user.name}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{userPresence.status || "offline"}</Badge>
            {unreadCount && unreadCount.count > 0 && (
              <Badge className="bg-red-500 text-white text-xs">{unreadCount.count}</Badge>
            )}
          </div>
        </div>
        <ChevronDownIcon className="size-4 shrink-0 text-gray-400" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="right" className="w-72 rounded-xl border border-cyan-400/20 bg-black/70 backdrop-blur-2xl shadow-[0_0_40px_-10px_rgba(56,189,248,0.4)] p-1 animate-fade-slide transition-all">
        <DropdownMenuLabel className="flex items-center gap-3 px-3 py-2">
          {renderAvatar()}
          <div className="flex flex-col overflow-hidden">
            <span className="truncate font-medium text-white">{profile?.displayName || data.user.name}</span>
            <span className="truncate text-sm text-gray-400">{data.user.email}</span>
            {profile?.customStatus && <span className="truncate text-xs text-gray-300">{profile.customStatus}</span>}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1 bg-white/10" />

        <div className="px-3 py-2">
          <label className="text-white text-xs font-medium mb-2 block">Status</label>
          {renderStatusSelect()}
        </div>

        <DropdownMenuSeparator className="my-1 bg-white/10" />

        {commonMenuItems.map(({ label, icon: Icon, href }) => (
          <DropdownMenuItem
            key={label}
            onClick={() => router.push(href + (label === "Profile" ? data.user.id : ""))}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-cyan-400/10 hover:text-cyan-300 rounded-md cursor-pointer transition-all duration-300"
          >
            <Icon className="size-4 text-gray-400" />
            <span className="flex-1">{label}</span>
            {label === "Friends" || label === "Notifications" ? (
              unreadCount && unreadCount.count > 0 ? (
                <Badge className="bg-red-500 text-white text-xs">{unreadCount.count}</Badge>
              ) : null
            ) : null}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="my-1 bg-white/10" />

        <DropdownMenuItem
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-md cursor-pointer transition-colors"
        >
          <LogOutIcon className="size-4" />
          <span className="flex-1">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      <style jsx global>{`
        @keyframes fadeSlide {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
            filter: blur(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        .animate-fade-slide {
          animation: fadeSlide 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </DropdownMenu>
  );
};
