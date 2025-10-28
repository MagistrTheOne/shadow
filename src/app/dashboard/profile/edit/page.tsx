"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Save, 
  ArrowLeft,
  Upload,
  X,
  Crown,
  Star,
  Shield,
  Zap
} from "lucide-react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { animations } from "@/lib/animations";
import { UploadButton } from "@/components/uploadthing/upload-button";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters").optional(),
  displayName: z.string().max(50, "Display name must be less than 50 characters").optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  customStatus: z.string().max(100, "Custom status must be less than 100 characters").optional(),
  status: z.enum(["online", "dnd", "away", "offline", "invisible"]),
});

type ProfileFormData = z.infer<typeof profileSchema>;

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

export default function EditProfilePage() {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [bannerUrl, setBannerUrl] = useState<string>("");

  const { data: profile, isLoading, isError } = trpc.users.getCurrentProfile.useQuery();

  const updateProfile = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      router.push("/dashboard/profile/" + profile?.id);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const updateStatus = trpc.users.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const watchedStatus = watch("status");

  // Load profile data
  useEffect(() => {
    if (profile) {
      reset({
        username: profile.username || "",
        displayName: profile.displayName || "",
        bio: profile.bio || "",
        customStatus: profile.customStatus || "",
        status: profile.status || "offline",
      });
      setAvatarUrl(profile.avatarUrl || "");
      setBannerUrl(profile.bannerUrl || "");
    }
  }, [profile, reset]);

  // Check username availability
  // Username checking functionality would be implemented here
  // For now, we'll skip validation

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync({
        ...data,
        avatarUrl: avatarUrl || undefined,
        bannerUrl: bannerUrl || undefined,
      });
    } catch (error) {
      // Error handling is done in mutation
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await updateStatus.mutateAsync({
        status: status as any,
        richPresence: (profile as any)?.richPresence,
      });
    } catch (error) {
      // Error handling is done in mutation
    }
  };

  if (isLoading) {
    return (
      <div className={`py-6 px-4 md:px-8 ${animations.fadeIn}`}>
        <LoadingState
          title="Loading profile..."
          description="Fetching your profile information"
        />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className={`py-6 px-4 md:px-8 ${animations.fadeIn}`}>
        <ErrorState
          title="Profile not found"
          description="Unable to load your profile information."
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
            <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
            <p className="text-gray-400">Update your profile information and settings</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Banner Upload */}
          <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.fadeInUp} ${animations.stagger1}`}>
            <CardHeader>
              <CardTitle className="text-white">Banner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bannerUrl && (
                  <div className="relative">
                    <img
                      src={bannerUrl}
                      alt="Banner preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => setBannerUrl("")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <UploadButton
                  type="banner"
                  onUploadComplete={setBannerUrl}
                  onUploadError={(error) => toast.error("Failed to upload banner")}
                  currentUrl={bannerUrl}
                />
              </div>
            </CardContent>
          </Card>

          {/* Avatar Upload */}
          <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.fadeInUp} ${animations.stagger2}`}>
            <CardHeader>
              <CardTitle className="text-white">Avatar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {avatarUrl && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                      onClick={() => setAvatarUrl("")}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <div className="flex-1">
                  <UploadButton
                    type="avatar"
                    onUploadComplete={setAvatarUrl}
                    onUploadError={(error) => toast.error("Failed to upload avatar")}
                    currentUrl={avatarUrl}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.fadeInUp} ${animations.stagger3}`}>
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input
                    id="username"
                    {...register("username")}
                    placeholder="Enter username"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                  {errors.username && (
                    <p className="text-red-400 text-sm">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-white">Display Name</Label>
                  <Input
                    id="displayName"
                    {...register("displayName")}
                    placeholder="Enter display name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                  {errors.displayName && (
                    <p className="text-red-400 text-sm">{errors.displayName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white">Bio</Label>
                <Textarea
                  id="bio"
                  {...register("bio")}
                  placeholder="Tell us about yourself..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                />
                {errors.bio && (
                  <p className="text-red-400 text-sm">{errors.bio.message}</p>
                )}
                <p className="text-gray-400 text-sm">
                  {watch("bio")?.length || 0}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customStatus" className="text-white">Custom Status</Label>
                <Input
                  id="customStatus"
                  {...register("customStatus")}
                  placeholder="😊 Working on something cool..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                {errors.customStatus && (
                  <p className="text-red-400 text-sm">{errors.customStatus.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.fadeInUp} ${animations.stagger4}`}>
            <CardHeader>
              <CardTitle className="text-white">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Online Status</Label>
                  <Select
                    value={watchedStatus}
                    onValueChange={(value) => {
                      setValue("status", value as any);
                      handleStatusChange(value);
                    }}
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
                      <SelectItem value="offline" className="text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-500 rounded-full" />
                          Offline
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges (Read-only for now) */}
          {profile.badges && profile.badges.length > 0 && (
            <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.fadeInUp} ${animations.stagger5}`}>
              <CardHeader>
                <CardTitle className="text-white">Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge: any, index: number) => (
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
                <p className="text-gray-400 text-sm mt-2">
                  Badges are earned through platform activity and cannot be manually edited.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className={`flex justify-end gap-4 ${animations.fadeInUp} ${animations.stagger5}`}>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || updateProfile.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting || updateProfile.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
