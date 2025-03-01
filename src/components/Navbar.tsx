"use client"
import { Button } from "@/components/ui/button";
import { User } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";
import { Menu, X, ChevronDown, User as UserIcon, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;

  return (
    <header>
      <nav 
        className="p-4 md:p-6 shadow-md bg-gradient-to-r from-gray-900 to-slate-800 text-white sticky top-0 z-50"
        role="navigation"
        aria-label="Main navigation"
        itemScope
        itemType="https://schema.org/SiteNavigationElement"
      >
        <div className="container mx-auto flex justify-between items-center">
          <Link 
            href="/" 
            className="text-xl font-bold hover:text-gray-300 transition-colors flex items-center gap-2"
            itemProp="url"
            aria-label="True Feedback Home"
          >
            <span className="bg-blue-600 p-1 rounded text-white">TF</span>
            <span itemProp="name" className="hidden sm:inline">True Feedback</span>
          </Link>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white focus:outline-none" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/topics" 
              className={`hover:text-gray-300 transition-colors px-3 py-2 rounded-md ${
                isActive("/topics") ? "bg-slate-700 text-white" : ""
              }`}
              itemProp="url"
              aria-label="Browse Topics"
            >
              <span itemProp="name">Topics</span>
            </Link>
            <Link 
              href="/dashboard" 
              className={`hover:text-gray-300 transition-colors px-3 py-2 rounded-md ${
                isActive("/dashboard") ? "bg-slate-700 text-white" : ""
              }`}
              itemProp="url"
              aria-label="Browse Dashboard"
            >
              <span itemProp="name">Dashboard</span>
            </Link>
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="hover:bg-slate-700 text-white flex items-center gap-2"
                  >
                    <span className="text-sm max-w-[150px] truncate">
                      {user.uname || user.email || "User"}
                    </span>
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="flex items-center gap-2">
                    <UserIcon size={16} />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2 text-red-600"
                    onClick={() => signOut()}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/sign-in" aria-label="Sign in to your account">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-colors" 
                  variant="default"
                  size="sm"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"} mt-4 transition-all duration-300`}>
          <div className="flex flex-col space-y-2">
            <Link 
              href="/topics" 
              className={`px-3 py-2 rounded-md ${
                isActive("/topics") ? "bg-slate-700 text-white" : "hover:bg-slate-800"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Topics
            </Link>
            <Link 
              href="/dashboard" 
              className={`px-3 py-2 rounded-md ${
                isActive("/dashboard") ? "bg-slate-700 text-white" : "hover:bg-slate-800"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            {session ? (
              <div className="border-t border-gray-700 pt-2 mt-2 space-y-2">
                <div className="px-3 py-2 text-gray-300">
                  {user.uname || user.email}
                </div>
                <Button 
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }} 
                  className="w-full bg-red-600 hover:bg-red-700 text-white" 
                  size="sm"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link 
                href="/sign-in"
                className="block"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
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
