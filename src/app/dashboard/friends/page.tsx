"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserPlus,
  Search,
  MessageSquare,
  Phone,
  UserMinus,
  Check,
  X,
  Shield,
  Clock,
  Crown,
  Star,
  Zap,
} from "lucide-react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { animations } from "@/lib/animations";
import { cn } from "@/lib/utils";

const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]";
    case "dnd":
      return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
    case "away":
      return "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]";
    case "invisible":
      return "bg-gray-500";
    default:
      return "bg-gray-600";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "online":
      return "Online";
    case "dnd":
      return "Do Not Disturb";
    case "away":
      return "Away";
    case "invisible":
      return "Invisible";
    default:
      return "Offline";
  }
};

const getBadgeIcon = (badge: string) => {
  switch (badge) {
    case "founder":
      return <Crown className="w-4 h-4" />;
    case "beta":
      return <Star className="w-4 h-4" />;
    case "moderator":
      return <Shield className="w-4 h-4" />;
    case "vip":
      return <Zap className="w-4 h-4" />;
    default:
      return <Star className="w-4 h-4" />;
  }
};

const getBadgeColor = (badge: string) => {
  switch (badge) {
    case "founder":
      return "bg-purple-500/20 text-purple-400 border-purple-400/30";
    case "beta":
      return "bg-blue-500/20 text-blue-400 border-blue-400/30";
    case "moderator":
      return "bg-green-500/20 text-green-400 border-green-400/30";
    case "vip":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-400/30";
  }
};

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const {
    data: friends,
    isLoading: friendsLoading,
    isError: friendsError,
    refetch: refetchFriends,
  } = trpc.friends.getFriends.useQuery();
  const {
    data: pendingRequests,
    isLoading: pendingLoading,
    isError: pendingError,
    refetch: refetchPending,
  } = trpc.friends.getPendingRequests.useQuery();
  const {
    data: blockedUsers,
    isLoading: blockedLoading,
    isError: blockedError,
    refetch: refetchBlocked,
  } = trpc.friends.getBlocked.useQuery();

  const acceptRequest = trpc.friends.acceptRequest.useMutation({
    onSuccess: () => {
      toast.success("Friend request accepted");
      refetchPending();
      refetchFriends();
    },
    onError: (error: any) => toast.error(error.message || "Failed to accept"),
  });

  const rejectRequest = trpc.friends.rejectRequest.useMutation({
    onSuccess: () => {
      toast.success("Friend request rejected");
      refetchPending();
    },
    onError: (error: any) => toast.error(error.message || "Failed to reject"),
  });

  const removeFriend = trpc.friends.removeFriend.useMutation({
    onSuccess: () => {
      toast.success("Friend removed");
      refetchFriends();
    },
    onError: (error: any) => toast.error(error.message || "Failed to remove"),
  });

  const unblockUser = trpc.friends.unblockUser.useMutation({
    onSuccess: () => {
      toast.success("User unblocked");
      refetchBlocked();
    },
    onError: (error: any) => toast.error(error.message || "Failed to unblock"),
  });

  const handleAcceptRequest = (friendshipId: string) =>
    acceptRequest.mutate({ friendshipId });
  const handleRejectRequest = (friendshipId: string) =>
    rejectRequest.mutate({ friendshipId });
  const handleRemoveFriend = (friendshipId: string) =>
    removeFriend.mutate({ friendshipId });
  const handleUnblockUser = (userId: string) => unblockUser.mutate({ userId });

  const filteredFriends =
    friends?.filter(
      (f: any) =>
        f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const filteredPending =
    pendingRequests?.filter(
      (r: any) =>
        r.sender.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.sender.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.sender.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const filteredBlocked =
    blockedUsers?.filter(
      (b: any) =>
        b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (friendsLoading || pendingLoading || blockedLoading)
    return (
      <div className="py-6 px-4 md:px-8">
        <LoadingState title="Loading friends..." description="Please wait" />
      </div>
    );

  if (friendsError || pendingError || blockedError)
    return (
      <div className="py-6 px-4 md:px-8">
        <ErrorState
          title="Error loading friends"
          description="Try refreshing the page."
        />
      </div>
    );

  return (
    <div className="py-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Friends</h1>
            <p className="text-gray-400">Manage your connections</p>
          </div>
          <Button className="bg-cyan-500/80 hover:bg-cyan-400 text-white shadow-[0_0_12px_-3px_rgba(56,189,248,0.5)]">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Friend
          </Button>
        </div>

        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-cyan-500/40"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
            <TabsTrigger value="all">All ({filteredFriends.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({filteredPending.length})
            </TabsTrigger>
            <TabsTrigger value="blocked">
              Blocked ({filteredBlocked.length})
            </TabsTrigger>
          </TabsList>

          {/* All Friends */}
          <TabsContent value="all">
            {filteredFriends.length ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                {filteredFriends.map((friend: any) => (
                  <Card
                    key={friend.id}
                    className="bg-gradient-to-b from-white/5 to-transparent border-white/10 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_0_25px_-10px_rgba(56,189,248,0.3)] hover:border-cyan-400/30"
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 ring-2 ring-white/10">
                          {friend.avatarUrl ? (
                            <img
                              src={friend.avatarUrl}
                              alt={friend.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-6 h-6 text-gray-400 mx-auto my-auto" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black",
                            getStatusColor(friend.status)
                          )}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">
                          {friend.displayName || friend.name}
                        </h3>
                        {friend.username && (
                          <p className="text-gray-400 text-sm truncate">
                            @{friend.username}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getStatusText(friend.status)}
                          </Badge>
                          {friend.customStatus && (
                            <span className="text-gray-300 text-xs truncate">
                              {friend.customStatus}
                            </span>
                          )}
                        </div>
                        {friend.badges?.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {friend.badges.slice(0, 2).map((badge: any) => (
                              <Badge
                                key={badge}
                                variant="outline"
                                className={cn("text-xs", getBadgeColor(badge))}
                              >
                                {getBadgeIcon(badge)}
                              </Badge>
                            ))}
                            {friend.badges.length > 2 && (
                              <span className="text-gray-400 text-xs">
                                +{friend.badges.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleRemoveFriend(friend.friendshipId)
                          }
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          disabled={removeFriend.isPending}
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/5 border-white/10 mt-6">
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">No friends yet</h3>
                  <p className="text-gray-400 mb-4">
                    Start building your network
                  </p>
                  <Button className="bg-cyan-500 hover:bg-cyan-400 text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Friend
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pending */}
          <TabsContent value="pending">
            {filteredPending.length ? (
              <div className="space-y-4 mt-4">
                {filteredPending.map((r: any) => (
                  <Card
                    key={r.id}
                    className="bg-white/5 border-white/10 hover:border-cyan-400/20 transition-all"
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
                        {r.sender.avatarUrl ? (
                          <img
                            src={r.sender.avatarUrl}
                            alt={r.sender.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-6 h-6 text-gray-400 mx-auto my-auto" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">
                          {r.sender.displayName || r.sender.name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          @{r.sender.username}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm">
                          <Clock className="w-4 h-4" />
                          {format(new Date(r.createdAt), "MMM dd, yyyy")}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(r.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-1" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRequest(r.id)}
                          className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                        >
                          <X className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/5 border-white/10 mt-6">
                <CardContent className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">
                    No pending requests
                  </h3>
                  <p className="text-gray-400">
                    You don't have any pending friend requests
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Blocked */}
          <TabsContent value="blocked">
            {filteredBlocked.length ? (
              <div className="space-y-4 mt-4">
                {filteredBlocked.map((b: any) => (
                  <Card
                    key={b.id}
                    className="bg-white/5 border-white/10 hover:border-cyan-400/20 transition-all"
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
                        {b.avatarUrl ? (
                          <img
                            src={b.avatarUrl}
                            alt={b.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-6 h-6 text-gray-400 mx-auto my-auto" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">
                          {b.displayName || b.name}
                        </h3>
                        <p className="text-gray-400 text-sm">@{b.username}</p>
                        <div className="flex items-center gap-2 mt-1 text-red-400 text-sm">
                          <Shield className="w-4 h-4" /> Blocked •{" "}
                          <span className="text-gray-400">
                            {format(new Date(b.blockedAt), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnblockUser(b.id)}
                        className="border-green-400/30 text-green-400 hover:bg-green-400/10"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Unblock
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/5 border-white/10 mt-6">
                <CardContent className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">
                    No blocked users
                  </h3>
                  <p className="text-gray-400">
                    You haven't blocked any users
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
