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
import { useRouter, useSearchParams } from "next/navigation"; //  

//icons
import { FaGoogle,FaGithub  } from "react-icons/fa";
 

    const formSchema =z.object(
        {
           email: z.string().email({message: "Invalid email address"}),
            password: z.string().min(1, {message: "Password is required"}),
        });

export const SignInView =() => {

    const router = useRouter();
    const searchParams = useSearchParams();
    const [error,setError] = useState<string | null>(null);
    const [pending,setPending] =useState(false);
    
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

        const form = useForm<z.infer<typeof formSchema>>(
            {resolver:zodResolver(formSchema),
                defaultValues: {
                    email: "",
                    password: "",
                },
            },
        );


        const onSubmit = (data: z.infer<typeof formSchema>) => {
            setError(null);
            setPending(true);
           authClient.signIn.email(
                {
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

        //Soscial auth
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
                     router.push(callbackUrl)
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
                        <h1 className="text-3xl font-bold">
                        Welcome back
                        </h1>
                        <p className="text-muted-foreground text-balance">
                         Login to your account
                        </p>
                    </div>
                    <div className="grid gap-3">
                    <FormField
                    control={form.control}
                    name="email"
                    render={({field}) =>(
                    <FormItem>
                    <FormLabel>Email</FormLabel>
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
                    <FormLabel>Password</FormLabel>
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
                >Sign in
                </Button>
                 <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className=" bg-card text-muted-foreground relative z-10 px-2">
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
                variant="outline"
                type="button"
                className="w-full"
                 disabled={pending}
                onClick={() =>onSocial("github")}
                >
                    <FaGithub/>
                

                </Button>
                </div>
                <div className="text-center text-sm">
                    Don&apos;t have an account?{"   "}
                    <Link 
                    href="/sign-up"
                    className="underline underline-offset-4"
                    >
                    Sign up
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
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[]:underline *:[]:underline-offset-4">
                By clicking continue you agre to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </div>
 
        </div>
    );
};