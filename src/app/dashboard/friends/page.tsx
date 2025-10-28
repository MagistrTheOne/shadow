"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Zap
} from "lucide-react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { animations } from "@/lib/animations";

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

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: friends, isLoading: friendsLoading, isError: friendsError, refetch: refetchFriends } = trpc.friends.getFriends.useQuery();
  const { data: pendingRequests, isLoading: pendingLoading, isError: pendingError, refetch: refetchPending } = trpc.friends.getPendingRequests.useQuery();
  const { data: blockedUsers, isLoading: blockedLoading, isError: blockedError, refetch: refetchBlocked } = trpc.friends.getBlocked.useQuery();

  const acceptRequest = trpc.friends.acceptRequest.useMutation({
    onSuccess: () => {
      toast.success("Friend request accepted");
      refetchPending();
      refetchFriends();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to accept friend request");
    },
  });

  const rejectRequest = trpc.friends.rejectRequest.useMutation({
    onSuccess: () => {
      toast.success("Friend request rejected");
      refetchPending();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reject friend request");
    },
  });

  const removeFriend = trpc.friends.removeFriend.useMutation({
    onSuccess: () => {
      toast.success("Friend removed");
      refetchFriends();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove friend");
    },
  });

  const unblockUser = trpc.friends.unblockUser.useMutation({
    onSuccess: () => {
      toast.success("User unblocked");
      refetchBlocked();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to unblock user");
    },
  });

  const handleAcceptRequest = (friendshipId: string) => {
    acceptRequest.mutate({ friendshipId });
  };

  const handleRejectRequest = (friendshipId: string) => {
    rejectRequest.mutate({ friendshipId });
  };

  const handleRemoveFriend = (friendshipId: string) => {
    removeFriend.mutate({ friendshipId });
  };

  const handleUnblockUser = (userId: string) => {
    unblockUser.mutate({ userId });
  };

  // Filter friends based on search query
  const filteredFriends = friends?.filter((friend: any) => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Filter pending requests based on search query
  const filteredPending = pendingRequests?.filter((request: any) => 
    request.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.sender.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.sender.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Filter blocked users based on search query
  const filteredBlocked = blockedUsers?.filter((blocked: any) => 
    blocked.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blocked.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blocked.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (friendsLoading || pendingLoading || blockedLoading) {
    return (
      <div className={`py-6 px-4 md:px-8 ${animations.fadeIn}`}>
        <LoadingState
          title="Loading friends..."
          description="Fetching your friends and requests"
        />
      </div>
    );
  }

  if (friendsError || pendingError || blockedError) {
    return (
      <div className={`py-6 px-4 md:px-8 ${animations.fadeIn}`}>
        <ErrorState
          title="Error loading friends"
          description="Unable to fetch your friends list. Please try refreshing the page."
        />
      </div>
    );
  }

  return (
    <div className={`py-6 px-4 md:px-8 ${animations.pageEnter}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`flex items-center justify-between mb-8 ${animations.fadeInUp}`}>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Friends</h1>
            <p className="text-gray-400">Manage your friends and connections</p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Friend
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className={`mb-6 ${animations.fadeInUp} ${animations.stagger1}`}>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className={`${animations.fadeInUp} ${animations.stagger2}`}>
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border-white/10">
            <TabsTrigger value="all" className="data-[state=active]:bg-white/10">
              All Friends ({filteredFriends.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-white/10">
              Pending ({filteredPending.length})
            </TabsTrigger>
            <TabsTrigger value="blocked" className="data-[state=active]:bg-white/10">
              Blocked ({filteredBlocked.length})
            </TabsTrigger>
          </TabsList>

          {/* All Friends Tab */}
          <TabsContent value="all" className="space-y-4">
            {filteredFriends.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredFriends.map((friend: any, index: number) => (
                  <Card key={friend.id} className={`bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-200 ${animations.listItem} ${animations[`stagger${index + 1}` as keyof typeof animations]}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
                            {friend.avatarUrl ? (
                              <img
                                src={friend.avatarUrl}
                                alt={friend.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${getStatusColor(friend.status || "offline")}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">
                            {friend.displayName || friend.name}
                          </h3>
                          {friend.username && (
                            <p className="text-gray-400 text-sm truncate">@{friend.username}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getStatusText(friend.status || "offline")}
                            </Badge>
                            {friend.customStatus && (
                              <span className="text-gray-300 text-xs truncate">{friend.customStatus}</span>
                            )}
                          </div>
                          {friend.badges && friend.badges.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {friend.badges.slice(0, 2).map((badge: any, badgeIndex: number) => (
                                <Badge
                                  key={badgeIndex}
                                  variant="outline"
                                  className={`text-xs ${getBadgeColor(badge)}`}
                                >
                                  {getBadgeIcon(badge)}
                                </Badge>
                              ))}
                              {friend.badges.length > 2 && (
                                <span className="text-gray-400 text-xs">+{friend.badges.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white hover:bg-white/10"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white hover:bg-white/10"
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveFriend(friend.friendshipId)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            disabled={removeFriend.isPending}
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">No friends yet</h3>
                  <p className="text-gray-400 mb-4">Start building your network by adding friends</p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Friend
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pending Requests Tab */}
          <TabsContent value="pending" className="space-y-4">
            {filteredPending.length > 0 ? (
              <div className="space-y-4">
                {filteredPending.map((request: any, index: number) => (
                  <Card key={request.id} className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.listItem} ${animations[`stagger${index + 1}` as keyof typeof animations]}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
                          {request.sender.avatarUrl ? (
                            <img
                              src={request.sender.avatarUrl}
                              alt={request.sender.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">
                            {request.sender.displayName || request.sender.name}
                          </h3>
                          {request.sender.username && (
                            <p className="text-gray-400 text-sm">@{request.sender.username}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400 text-sm">
                              {format(new Date(request.createdAt), "MMM dd, yyyy")}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={acceptRequest.isPending}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectRequest(request.id)}
                            className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                            disabled={rejectRequest.isPending}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">No pending requests</h3>
                  <p className="text-gray-400">You don't have any pending friend requests</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Blocked Users Tab */}
          <TabsContent value="blocked" className="space-y-4">
            {filteredBlocked.length > 0 ? (
              <div className="space-y-4">
                {filteredBlocked.map((blocked: any, index: number) => (
                  <Card key={blocked.id} className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.listItem} ${animations[`stagger${index + 1}` as keyof typeof animations]}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
                          {blocked.avatarUrl ? (
                            <img
                              src={blocked.avatarUrl}
                              alt={blocked.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">
                            {blocked.displayName || blocked.name}
                          </h3>
                          {blocked.username && (
                            <p className="text-gray-400 text-sm">@{blocked.username}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Shield className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 text-sm">Blocked</span>
                            <span className="text-gray-400 text-sm">
                              {format(new Date(blocked.blockedAt), "MMM dd, yyyy")}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnblockUser(blocked.id)}
                          className="border-green-400/30 text-green-400 hover:bg-green-400/10"
                          disabled={unblockUser.isPending}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Unblock
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">No blocked users</h3>
                  <p className="text-gray-400">You haven't blocked any users</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
