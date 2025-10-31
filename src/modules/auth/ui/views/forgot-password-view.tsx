"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { OctagonAlertIcon, CheckCircleIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";

// COMPONENTS
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const ForgotPasswordView = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    setSuccess(false);
    setPending(true);

    try {
      // Better Auth password reset via API
      const response = await fetch('/api/auth/forget-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to send reset email' }));
        throw new Error(errorData.message || 'Failed to send reset email');
      }

      setSuccess(true);
      setPending(false);
    } catch (err: any) {
      spareError(err.message || "Failed to send reset email. Please try again.");
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-3xl font-bold text-white">
                    Forgot password?
                  </h1>
                  <p className="text-white/70 text-balance">
                    Enter your email address and we&apos;ll send you a link to reset your password
                  </p>
                </div>

                {success ? (
                  <Alert className="bg-green-500/10 border-green-500/20">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <AlertTitle className="text-green-500">
                      Check your email! We&apos;ve sent you a password reset link.
                    </AlertTitle>
                  </Alert>
                ) : (
                  <>
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="yourgod@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {!!error && (
                      <Alert className="bg-destructive/10 border-none">
                        <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                        <AlertTitle>{error}</AlertTitle>
                      </Alert>
                    )}

                    <Button
                      disabled={pending}
                      type="submit"
                      className="w-full"
                    >
                      Send reset link
                    </Button>
                  </>
                )}

                <div className="text-center text-sm text-white/70">
                  Remember your password?{"   "}
                  <Link
                    href="/sign-in"
                    className="text-white hover:text-white/90 underline underline-offset-4"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </form>
          </Form>
          <div className="bg-radial from-sidebar-accent to-sidebar relative hidden md:flex flex-col gap-y-4 items-center justify-center">
            <img src="/logo.svg" alt="Image" className="h-[92px] w-[92px]" />
            <p className="text-2xl font-semibold text-white">SHADOW.AI</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

