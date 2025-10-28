import { Suspense } from "react";
import { ProfilePageClient } from "./profile-client";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePageClient id={id} />
    </Suspense>
  );
}