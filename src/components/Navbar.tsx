"use client"
import { Button } from "@/components/ui/button";
import { User } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user;

  return (
    <header>
      <nav 
        className="p-4 md:p-6 shadow-md bg-gray-900 text-white sticky top-0 z-50"
        role="navigation"
        aria-label="Main navigation"
        itemScope
        itemType="https://schema.org/SiteNavigationElement"
      >
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <Link 
            href="/" 
            className="text-xl font-bold hover:text-gray-300 transition-colors"
            itemProp="url"
            aria-label="True Feedback Home"
          >
            <span itemProp="name">True Feedback</span>
          </Link>

          <div className="flex flex-col md:flex-row items-center space-x-0 md:space-x-6 space-y-4 md:space-y-0 mt-4 md:mt-0">
            <Link 
              href="/topics" 
              className="hover:text-gray-300 transition-colors"
              itemProp="url"
              aria-label="Browse Topics"
            >
              <span itemProp="name">Topics</span>
            </Link>
            <Link 
              href="/dashboard" 
              className="hover:text-gray-300 transition-colors"
              itemProp="url"
              aria-label="Browse Dashboard"
            >
              <span itemProp="name">Dashboard</span>
            </Link>
            {session ? (
              <>
                <div className="flex items-center gap-4" role="navigation" aria-label="User actions">
                  <span className="text-gray-300 text-sm" aria-label="User email">
                    ({user.uname || user.email})
                  </span>
                  <Button 
                    onClick={() => signOut()} 
                    className="w-full md:w-auto bg-slate-100 hover:bg-slate-200 text-black transition-colors" 
                    variant='outline'
                    size="sm"
                    aria-label="Sign out"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <Link 
                href="/sign-in"
                aria-label="Sign in to your account"
              >
                <Button 
                  className="w-full md:w-auto bg-slate-100 hover:bg-slate-200 text-black transition-colors" 
                  variant={'outline'}
                  size="sm"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
