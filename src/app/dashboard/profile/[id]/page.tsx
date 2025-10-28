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
  Zap
} from "lucide-react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { animations } from "@/lib/animations";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
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

const getBadgeIcon = (badge: string) => {
  switch (badge) {
    case "founder": return <Crown className="w-4 h-4" />;
    case "beta": return <Star className="w-4 h-4" />;
    case "moderator": return <Shield className="w-4 h-4" />;
    case "vip": return <Zap className="w-4 h-4" />;
    default: return <Star className="w-4 h-4" />;
  }
};

const getBadgeColor = (badge: string) => {
  switch (badge) {
    case "founder": return "bg-purple-500/20 text-purple-400 border-purple-400/30";
    case "beta": return "bg-blue-500/20 text-blue-400 border-blue-400/30";
    case "moderator": return "bg-green-500/20 text-green-400 border-green-400/30";
    case "vip": return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-400/30";
  }
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { data: profile, isLoading: profileLoading, isError: profileError } = trpc.users.getProfile.useQuery({ userId: id });
  const { data: currentUser } = trpc.users.getCurrentProfile.useQuery();
  const { data: friends } = trpc.friends.getFriends.useQuery();
  const { data: pendingRequests } = trpc.friends.getPendingRequests.useQuery();

  // Check if this is the current user's profile
  const isOwnProfile = currentUser?.id === id;
  
  // Check friendship status
  const friendship = friends?.find(f => f.id === id);
  const pendingRequest = pendingRequests?.find(r => r.senderId === id);

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

  const removeFriend = trpc.friends.removeFriend.useMutation({
    onSuccess: () => {
      toast.success("Friend removed");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove friend");
    },
  });

  const handleSendRequest = () => {
    if (profile) {
      sendFriendRequest.mutate({ receiverId: profile.id });
    }
  };

  const handleAcceptRequest = () => {
    if (pendingRequest) {
      acceptRequest.mutate({ friendshipId: pendingRequest.id });
    }
  };

  const handleRemoveFriend = () => {
    if (friendship) {
      removeFriend.mutate({ friendshipId: friendship.friendshipId });
    }
  };

  if (profileLoading) {
    return (
      <div className={`py-6 px-4 md:px-8 ${animations.fadeIn}`}>
        <LoadingState
          title="Loading profile..."
          description="Fetching user information"
        />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className={`py-6 px-4 md:px-8 ${animations.fadeIn}`}>
        <ErrorState
          title="Profile not found"
          description="The user profile you're looking for doesn't exist or has been removed."
        />
      </div>
    );
  }

  return (
    <div className={`py-6 px-4 md:px-8 ${animations.pageEnter}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`flex items-center gap-4 mb-8 ${animations.fadeInUp}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">
              {profile.displayName || profile.name}
            </h1>
            <p className="text-gray-400">User Profile</p>
          </div>
          {isOwnProfile && (
            <Button asChild>
              <Link href="/dashboard/profile/edit">
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          )}
        </div>

        {/* Banner */}
        {profile.bannerUrl && (
          <div className={`relative h-48 rounded-lg overflow-hidden mb-6 ${animations.fadeInUp} ${animations.stagger1}`}>
            <img
              src={profile.bannerUrl}
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Info */}
            <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.fadeInUp} ${animations.stagger2}`}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-black ${getStatusColor(profile.status || "offline")}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-white text-xl">
                      {profile.displayName || profile.name}
                    </CardTitle>
                    {profile.username && (
                      <p className="text-gray-400 text-sm">@{profile.username}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {getStatusText(profile.status || "offline")}
                      </Badge>
                      {profile.customStatus && (
                        <span className="text-gray-300 text-sm">{profile.customStatus}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.bio && (
                  <div>
                    <h4 className="text-white font-medium mb-2">About</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Badges */}
                {profile.badges && profile.badges.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.badges.map((badge, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className={`text-xs ${getBadgeColor(badge)}`}
                        >
                          {getBadgeIcon(badge)}
                          <span className="ml-1 capitalize">{badge}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {friends?.length || 0}
                    </div>
                    <div className="text-gray-400 text-sm">Friends</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-gray-400 text-sm">Days Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {!isOwnProfile && (
              <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.fadeInUp} ${animations.stagger3}`}>
                <CardHeader>
                  <CardTitle className="text-white">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {friendship ? (
                      <Button
                        onClick={handleRemoveFriend}
                        variant="outline"
                        className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                        disabled={removeFriend.isPending}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Remove Friend
                      </Button>
                    ) : pendingRequest ? (
                      <Button
                        onClick={handleAcceptRequest}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={acceptRequest.isPending}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Accept Request
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSendRequest}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={sendFriendRequest.isPending}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Add Friend
                      </Button>
                    )}
                    
                    <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    
                    <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.fadeInUp} ${animations.stagger4}`}>
              <CardHeader>
                <CardTitle className="text-white text-lg">Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <span className="text-sm">
                    Joined {format(new Date(profile.createdAt), "MMM dd, yyyy")}
                  </span>
                </div>
                {profile.lastSeenAt && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">
                      Last seen {format(new Date(profile.lastSeenAt), "MMM dd, HH:mm")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rich Presence */}
            {profile.richPresence && (
              <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.fadeInUp} ${animations.stagger5}`}>
                <CardHeader>
                  <CardTitle className="text-white text-lg">Currently</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-300 text-sm">
                    {profile.richPresence.type === "meeting" && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span>In a meeting</span>
                      </div>
                    )}
                    {profile.richPresence.type === "call" && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>In a call</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
