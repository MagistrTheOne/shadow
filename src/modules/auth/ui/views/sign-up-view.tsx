"use client"
//client component( COMMENT NOT CHATGPT THIS..MY CHAOS)
import {z} from "zod";
import {zodResolver}  from "@hookform/resolvers/zod";
import {   OctagonAlertIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";

//COMPONENTS
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormControl,FormField,FormItem,FormLabel,FormMessage,Form } from "@/components/ui/form";
import { Alert,AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaGoogle,FaGithub  } from "react-icons/fa";
 

    const formSchema =z.object(
        {
           name: z.string().min(2,{message: "Name must be at least 2 characters"}),
           email: z.string().email({message: "Invalid email address"}),
           password: z.string()
               .min(8, {message: "Password must be at least 8 characters"})
               .regex(/[A-Z]/, {message: "Password must contain at least one uppercase letter"})
               .regex(/[a-z]/, {message: "Password must contain at least one lowercase letter"})
               .regex(/[0-9]/, {message: "Password must contain at least one number"})
               .regex(/[^A-Za-z0-9]/, {message: "Password must contain at least one special character"}),
           confirmPassword: z.string().min(1, {message: "Password confirmation is required"}),
        })
        .refine((data) => data.password ===data.confirmPassword,{
            message: "Passwords don't match",
            path: ["confirmPassword"]
        });

export const SignUpView =() => {

    const router = useRouter();
    const searchParams = useSearchParams();
    const [error,setError] = useState<string | null>(null);
    const [pending,setPending] =useState(false);
    
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

        const form = useForm<z.infer<typeof formSchema>>(
            {resolver:zodResolver(formSchema),
                defaultValues: {
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                },
            },
        );


        const onSubmit = (data: z.infer<typeof formSchema>) => {
            setError(null);
            setPending(true);
           authClient.signUp.email(
                {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                },
                {
                    onSuccess: () => {
                     setPending(false);
                     router.push(callbackUrl)
                    },
                    onError: ({error}) => {
                        setError(error.message);
                        setPending(false);
                    }
                },
            );
        };

            const onSocial = (provider:"github" | "google") => {
            setError(null);
            setPending(true);
           authClient.signIn.social(
                {
                     provider: provider,
                     callbackURL: callbackUrl
                },
                {
                    onSuccess: () => {
                        setPending(false);
                        router.push(callbackUrl);
                    },
                    onError: ({error}) => {
                        setError(error.message);
                        setPending(false);
                    }
                },
            );
        };


    return (
        <div className="flex flex-col gap-6">
        <Card className=" overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
            <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-3xl font-bold text-white">
                        Let&apos;s get started
                        </h1>
                        <p className="text-white/70 text-balance">
                         Create your account
                        </p>
                    </div>
                    <div className="grid gap-3">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({field}) =>(
                    <FormItem>
                    <FormLabel className="text-white">Name</FormLabel>
                    <FormControl>
                        <Input
                        type="text"
                        placeholder="your evil name"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage/>
                    </FormItem>
                    )}
                    />
                </div>
                    <div className="grid gap-3">
                    <FormField
                    control={form.control}
                    name="email"
                    render={({field}) =>(
                    <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                        <Input
                        type="email"
                        placeholder="yourgod@example.com"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage/>
                    </FormItem>
                    )}
                    />
                </div>
                <div className="grid gap-3">
                    <FormField
                    control={form.control}
                    name="password"
                    render={({field}) =>(
                    <FormItem>
                    <FormLabel className="text-white">Password</FormLabel>
                    <FormControl>
                        <Input
                        type="password"
                        placeholder="Min 8 chars, uppercase, lowercase, number, special"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage/>
                    </FormItem>
                    )}
                    />
                </div>
                 <div className="grid gap-3">
                    <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({field}) =>(
                    <FormItem>
                    <FormLabel className="text-white">Confirm Password</FormLabel>
                    <FormControl>
                        <Input
                        type="password"
                        placeholder="**********"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage/>
                    </FormItem>
                    )}
                    />
                </div>

                {!!error && (
                    <Alert className="bg-destructive/10 border-none">
                    <OctagonAlertIcon className=" h-4 w-4 !text-destructive"/>
                     <AlertTitle>{error}</AlertTitle>
                    </Alert>
                )}
                <Button
                disabled={pending}
                type="submit"
                className="w-full"
                >Sign up
                </Button>
                 <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className=" bg-card text-white/70 relative z-10 px-2">
                    or continue with
                </span>
                </div>
                <div className="grid grid-cols-2 gap-4">   
                <Button
                disabled={pending}
                variant="outline"
                type="button"
                className="w-full"
                onClick={() =>onSocial("google")}
                >
                 <FaGoogle/>
                </Button>
                <Button
                disabled={pending}
                variant="outline"
                type="button"
                className="w-full"
                onClick={() =>onSocial("github")}
                >
                 <FaGithub/>
                </Button>
                </div>
                <div className="text-center text-sm text-white/70">
                    Already have an account?{"   "}
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
                <img src="/logo.svg" alt="Image" className="h-[92px] w-[92px]"/>
                <p className="text-2xl font-semibold text-white">SHADOW.AI</p>
                </div>
            </CardContent>
        </Card>
        <div className="text-white/60 *:[a]:hover:text-white/90 text-center text-xs text-balance *:[]:underline *:[]:underline-offset-4">
                By clicking continue you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </div>


        </div>
    );
};