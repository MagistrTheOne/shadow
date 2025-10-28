"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";

interface NavbarProps {
  session?: any;
}

export const Navbar = ({ session }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/30 backdrop-blur-2xl border-b border-white/10 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center border border-cyan-400/30 shadow-[0_0_20px_-5px_rgba(56,189,248,0.5)] group-hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.7)] transition-all duration-300">
              <Zap className="w-5 h-5 text-cyan-300" />
            </div>
            <span className="text-lg sm:text-xl font-semibold text-white tracking-wide">
              Shadow AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
            {["Product", "Features", "Demo", "Pricing"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-gray-300 hover:text-cyan-300 transition-colors duration-300 text-sm sm:text-base"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <Button
                  variant="ghost"
                  className="text-gray-200 hover:text-white hover:bg-white/10 transition"
                  asChild
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  className="bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 backdrop-blur-sm transition"
                  asChild
                >
                  <Link href="/dashboard/profile/edit">Profile</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-gray-200 hover:text-white hover:bg-white/10 transition"
                  asChild
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button
                  className="bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 backdrop-blur-sm transition"
                  asChild
                >
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-white/10"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden animate-fadeIn">
            <div className="px-3 py-4 mt-2 rounded-lg bg-black/70 backdrop-blur-xl border border-white/10 space-y-2">
              {["Product", "Features", "Demo", "Pricing"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="block px-3 py-2 rounded-lg text-gray-300 hover:text-cyan-300 hover:bg-cyan-400/10 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}

              <div className="pt-3 space-y-2 border-t border-white/10">
                {session ? (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full text-white hover:bg-white/10"
                      asChild
                    >
                      <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      className="w-full bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-300 border border-cyan-400/30"
                      asChild
                    >
                      <Link
                        href="/dashboard/profile/edit"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full text-white hover:bg-white/10"
                      asChild
                    >
                      <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button
                      className="w-full bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-300 border border-cyan-400/30"
                      asChild
                    >
                      <Link
                        href="/sign-up"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
