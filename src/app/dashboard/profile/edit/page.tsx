'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  User,
  X,
  Zap,
  Shield,
  Star,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/trpc/client';
import { toast } from 'sonner';
import { UploadButton } from '@/components/uploadthing/upload-button';
import { animations } from '@/lib/animations';
import { LoadingState } from '@/components/loading-state';
import { ErrorState } from '@/components/error-state';

const schema = z.object({
  username: z.string().min(3).max(20).optional(),
  displayName: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  customStatus: z.string().max(100).optional(),
  status: z.enum(['online', 'dnd', 'away', 'offline', 'invisible']),
});
type FormData = z.infer<typeof schema>;

const badgeMap = {
  founder: { icon: Crown, color: 'text-purple-400 border-purple-400/30 bg-purple-500/10' },
  beta: { icon: Star, color: 'text-blue-400 border-blue-400/30 bg-blue-500/10' },
  moderator: { icon: Shield, color: 'text-slate-300 border-slate-400/30 bg-slate-600/10' },
  vip: { icon: Zap, color: 'text-amber-400 border-amber-400/30 bg-amber-500/10' },
};

export default function EditProfilePage() {
  const router = useRouter();
  const [avatar, setAvatar] = useState('');
  const [banner, setBanner] = useState('');
  const [initialized, setInitialized] = useState(false);
  const { data, isLoading, isError } = trpc.users.getCurrentProfile.useQuery();
  const update = trpc.users.updateProfile.useMutation({
    onSuccess: () => toast.success('Profile updated'),
    onError: e => toast.error(e.message || 'Update failed'),
  });
  const statusMut = trpc.users.updateStatus.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!initialized && data) {
      reset({
        username: data.username || '',
        displayName: data.displayName || '',
        bio: data.bio || '',
        customStatus: data.customStatus || '',
        status: data.status || 'offline',
      });
      setAvatar(data.avatarUrl || '');
      setBanner(data.bannerUrl || '');
      setInitialized(true);
    }
  }, [initialized, data, reset]);

  const onSubmit = async (values: FormData) => {
    await update.mutateAsync({ ...values, avatarUrl: avatar, bannerUrl: banner });
  };

  if (isLoading)
    return <LoadingState title="Loading profile..." description="Fetching profile data" />;
  if (isError || !data)
    return <ErrorState title="Profile not found" description="Unable to load profile." />;

  return (
    <div className={`px-4 md:px-8 py-6 ${animations.pageEnter}`}>
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-white">Edit Profile</h1>
            <p className="text-slate-400 text-sm">Manage your profile info</p>
          </div>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Banner */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Banner</CardTitle>
            </CardHeader>
            <CardContent>
              {banner && (
                <div className="relative mb-4">
                  <img src={banner} alt="Banner" className="w-full h-32 rounded-lg object-cover" />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => setBanner('')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <UploadButton type="banner" currentUrl={banner} onUploadComplete={setBanner} />
            </CardContent>
          </Card>

          {/* Avatar */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Avatar</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="object-cover w-full h-full" />
                  ) : (
                    <User className="w-8 h-8 text-slate-500" />
                  )}
                </div>
                {avatar && (
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => setAvatar('')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <UploadButton type="avatar" currentUrl={avatar} onUploadComplete={setAvatar} />
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username" className="text-slate-200">
                    Username
                  </Label>
                  <Input
                    id="username"
                    {...register('username')}
                    placeholder="Enter username"
                    className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400"
                  />
                  {errors.username && (
                    <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="displayName" className="text-slate-200">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    {...register('displayName')}
                    placeholder="Enter display name"
                    className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio" className="text-slate-200">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  placeholder="Tell something about you..."
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400 min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="customStatus" className="text-slate-200">
                  Custom Status
                </Label>
                <Input
                  id="customStatus"
                  {...register('customStatus')}
                  placeholder="🧠 Coding something cool..."
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400"
                />
              </div>

              {/* Status */}
              <div>
                <Label className="text-slate-200">Online Status</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(v: any) => {
                    setValue('status', v as any);
                    statusMut.mutate({ status: v as any });
                  }}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    {[
                      ['online', 'green'],
                      ['dnd', 'red'],
                      ['away', 'yellow'],
                      ['invisible', 'gray'],
                      ['offline', 'gray'],
                    ].map(([value, color]) => (
                      <SelectItem key={value} value={value} className="text-white">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full bg-${color}-500`} />
                          {value}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          {!!data.badges?.length && (
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Badges</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {data.badges.map((b: string) => {
                  const info = badgeMap[b as keyof typeof badgeMap] || badgeMap.beta;
                  const Icon = info.icon;
                  return (
                    <Badge key={b} className={`gap-1 text-xs ${info.color}`}>
                      <Icon className="w-3 h-3" />
                      {b}
                    </Badge>
                  );
                })}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => router.back()} className="text-slate-300">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || update.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting || update.isPending ? 'Saving...' : <><Save className="w-4 h-4 mr-1" />Save</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
