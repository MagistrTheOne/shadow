"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react"
import { authClient } from "@/lib/auth-client"; //import the auth client
export default function Home () {

  const { data: session, } = authClient.useSession() 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //Submit Auth Client
  const onSubmit = () => {
    authClient.signUp.email({
      email,
      name,
      password,
    }, 
    {
      onError: () => {
        window.alert("Error,Something ,Don't panic,try again!")
      },
      onSuccess: () => {
        window.alert("Succes")
      }

    }

  );
  };
   //Submit Auth Client
  const onLogin = () => {
    authClient.signIn.email({
      email,
      password,
    }, 
    {
      onError: () => {
        window.alert("Error,Something ,Don't panic,try again!")
      },
      onSuccess: () => {
        window.alert("Succes")
      }

    }

  );
  }

  if (session) {
    return (
      <div className=" flex flex-col p-4 gap-y-4">
        <p>Logged in {session.user.name}</p>
        <Button onClick={() => authClient.signOut()}>
          Sign out
        </Button>
      </div>
    );
  }


  return (
    //Main Div
    <div className="flex flex-col gap-y-10">
    <div className="p-4 flex flex-col gap-y-4">
     <Input placeholder="name" value={name}  onChange={(e) =>setName(e.target.value)}/>
     <Input placeholder="email"value={email} onChange={(e) =>setEmail(e.target.value)}/>
     <Input placeholder="password"value={password} onChange={(e) =>setPassword(e.target.value)}  type="password"/>
    <Button onClick={onSubmit}>
      Create user
    </Button>
    </div>
     <div className="flex flex-col gap-y-10">
    <div className="p-4 flex flex-col gap-y-4">
     <Input placeholder="email"value={email} onChange={(e) =>setEmail(e.target.value)}/>
     <Input placeholder="password"value={password} onChange={(e) =>setPassword(e.target.value)}  type="password"/>
    <Button onClick={onLogin}>
      Login
    </Button>
    </div>
    </div>
    </div>
    
  )
}