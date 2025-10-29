"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  Users, 
  MessageSquare, 
  Phone,
  Settings,
  ArrowLeft,
  Crown,
  Star,
  Shield,
  CheckCircle,
  XCircle,
  UserPlus,
  UserMinus,
  UserX,
  Check,
  X,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Share2,
  Heart,
  ThumbsUp,
  MessageCircle,
  Video,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  Settings as SettingsIcon,
  Bell,
  BellOff,
  Shield as ShieldIcon,
  Crown as CrownIcon,
  Star as StarIcon,
  Zap,
  Award,
  Trophy,
  Target,
  TrendingUp,
  BarChart3,
  Activity,
  Globe,
  MapPin,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Users as UsersIcon,
  MessageSquare as MessageSquareIcon,
  Phone as PhoneCallIcon,
  Video as VideoIcon,
  Mic as MicIcon,
  Camera as CameraIcon,
  Volume2 as VolumeIcon,
  Settings as SettingsIconAlt,
  Bell as BellIcon,
  Shield as ShieldIconAlt,
  Crown as CrownIconAlt,
  Star as StarIconAlt,
  Zap as ZapIcon,
  Award as AwardIcon,
  Trophy as TrophyIcon,
  Target as TargetIcon,
  TrendingUp as TrendingUpIcon,
  BarChart3 as BarChartIcon,
  Activity as ActivityIcon,
  Globe as GlobeIcon,
  MapPin as MapPinIcon,
} from "lucide-react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useUserPresence } from "@/stores/dashboard-store";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { animations } from "@/lib/animations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { GeneratedAvatar } from "@/components/generate-avatar";
import { AnnaProfile } from "@/components/anna-avatar";

interface ProfilePageClientProps {
  id: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "online": return "bg-green-500";
    case "dnd": return "bg-red-500";
    case "away": return "bg-yellow-500";
    case "invisible": return "bg-gray-500";
    default: return "bg-gray-500";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "online": return "Online";
    case "dnd": return "Do Not Disturb";
    case "away": return "Away";
    case "invisible": return "Invisible";
    default: return "Offline";
  }
};

const getBadgeColor = (badge: string) => {
  switch (badge.toLowerCase()) {
    case "founder": return "bg-purple-500/20 text-purple-400 border-purple-400/30";
    case "beta": return "bg-blue-500/20 text-blue-400 border-blue-400/30";
    case "moderator": return "bg-red-500/20 text-red-400 border-red-400/30";
    case "vip": return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-400/30";
  }
};

export function ProfilePageClient({ id }: ProfilePageClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { data: profile, isLoading: profileLoading, isError: profileError } = trpc.users.getProfile.useQuery({ userId: id });
  const { data: currentUser } = trpc.users.getCurrentProfile.useQuery();
  const { data: friends } = trpc.friends.getFriends.useQuery();
  const { data: pendingRequests } = trpc.friends.getPendingRequests.useQuery();
  
  // Zustand presence state
  const { userPresence, setUserStatus, setCustomStatus, setRichPresence } = useUserPresence();

  // Check if this is the current user's profile
  const isOwnProfile = currentUser?.id === id;
  
  // Check friendship status
  const friendship = friends?.find((f: any) => f.id === id);
  const pendingRequest = pendingRequests?.find((r: any) => r.senderId === id);

  const sendFriendRequest = trpc.friends.sendRequest.useMutation({
    onSuccess: () => {
      toast.success("Friend request sent");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send friend request");
    },
  });

  const acceptRequest = trpc.friends.acceptRequest.useMutation({
    onSuccess: () => {
      toast.success("Friend request accepted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to accept friend request");
    },
  });

  const rejectRequest = trpc.friends.rejectRequest.useMutation({
    onSuccess: () => {
      toast.success("Friend request rejected");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reject friend request");
    },
  });

  const removeFriend = trpc.friends.removeFriend.useMutation({
    onSuccess: () => {
      toast.success("Friend removed");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove friend");
    },
  });

  const blockUser = trpc.friends.blockUser.useMutation({
    onSuccess: () => {
      toast.success("User blocked");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to block user");
    },
  });

  const unblockUser = trpc.friends.unblockUser.useMutation({
    onSuccess: () => {
      toast.success("User unblocked");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to unblock user");
    },
  });

  if (profileLoading) {
    return <LoadingState title="Loading profile..." description="Fetching user details" />;
  }

  if (profileError || !profile) {
    return <ErrorState title="Profile not found" description="The user profile you are looking for does not exist or is inaccessible." />;
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">
            {profile.displayName || profile.name}
          </h1>
        </div>

        {/* Profile Card */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-8">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white/20">
                  <AvatarImage src={profile.avatarUrl || ""} alt={profile.displayName || profile.name} />
                  <AvatarFallback>
                    <GeneratedAvatar seed={profile.name} variant="initials" className="w-full h-full" />
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-black ${getStatusColor(profile.status || 'offline')}`} />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">{profile.displayName || profile.name}</h2>
                  {profile.badges && profile.badges.length > 0 && (
                    <div className="flex gap-1">
                      {profile.badges.map((badge: string, index: number) => (
                        <Badge key={index} variant="outline" className={`text-xs ${getBadgeColor(badge)}`}>
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* ANNA Avatar */}
                <div className="mb-4">
                  <AnnaProfile />
                </div>
                
                <p className="text-gray-400 mb-2">@{profile.username || profile.name.toLowerCase()}</p>
                
                {profile.bio && (
                  <p className="text-gray-300 mb-4">{profile.bio}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(userPresence.status || 'offline')}`} />
                    <span>{getStatusText(userPresence.status || 'offline')}</span>
                  </div>
                  {userPresence.customStatus && (
                    <span className="text-gray-300">{userPresence.customStatus}</span>
                  )}
                  {userPresence.lastSeenAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Last seen {format(new Date(userPresence.lastSeenAt), "MMM dd, yyyy")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Button variant="outline" onClick={() => router.push(`/dashboard/profile/edit`)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    {friendship ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            <Users className="w-4 h-4 mr-2" />
                            Friends
                            <MoreVertical className="w-4 h-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => removeFriend.mutate({ friendshipId: friendship.id })}>
                            <UserMinus className="w-4 h-4 mr-2" />
                            Remove Friend
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => blockUser.mutate({ userId: id })}>
                            <UserX className="w-4 h-4 mr-2" />
                            Block User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : pendingRequest ? (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => acceptRequest.mutate({ friendshipId: pendingRequest.id })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => rejectRequest.mutate({ friendshipId: pendingRequest.id })}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => sendFriendRequest.mutate({ receiverId: id })}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Friend
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-lg">Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-sm">{profile.email}</span>
              </div>
              {userPresence.richPresence?.type === "meeting" && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>In a meeting</span>
                </div>
              )}
              {userPresence.richPresence?.type === "call" && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>In a call</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
