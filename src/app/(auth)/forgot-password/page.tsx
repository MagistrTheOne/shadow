export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { ForgotPasswordView } from "@/modules/auth/ui/views/forgot-password-view";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const Page = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!!session) {
      redirect("/dashboard");
    }

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <ForgotPasswordView />
      </Suspense>
    );
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error &&
      typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    console.error("Auth session error:", error);
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <ForgotPasswordView />
      </Suspense>
    );
  }
};

export default Page;

