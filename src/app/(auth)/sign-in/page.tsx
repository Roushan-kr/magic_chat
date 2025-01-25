"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Component() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        SignIn as {session?.user?.email}
        <br />
        <button onClick={() => signOut()}>Sign Out</button>
      </>
    );
  }
  return <button className="bg-red-400 p-3 m-2 rounded-md"onClick={() => signIn()}>Sign In</button>;
}
