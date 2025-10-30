"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";

interface NavbarProps {
  session?: any;
}

export const Navbar = ({ session }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

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
            {["Product", "Features", "Pricing", "Whitelist"].map((item) => (
              <Link
                key={item}
                href={item === "Whitelist" ? "/whitelist" : `/${item.toLowerCase()}`}
                className="text-gray-300 hover:text-cyan-300 transition-colors duration-300 text-sm sm:text-base"
              >
                {t(`nav.${item.toLowerCase()}`)}
              </Link>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            {!session ? (
              <>
                <Link href="/sign-up">
                  <Button variant="secondary" size="sm">Sign Up</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href={`/dashboard/profile/${session.user?.id || "me"}`}>
                  <Button variant="default" size="sm">Profile</Button>
                </Link>
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
              {["Product", "Features", "Pricing", "Whitelist"].map((item) => (
                <Link
                  key={item}
                  href={item === "Whitelist" ? "/whitelist" : `/${item.toLowerCase()}`}
                  className="block px-3 py-2 rounded-lg text-gray-300 hover:text-cyan-300 hover:bg-cyan-400/10 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(`nav.${item.toLowerCase()}`)}
                </Link>
              ))}

              <div className="pt-3 space-y-2 border-t border-white/10">
                <div className="flex justify-center mb-2">
                  <LanguageSwitcher />
                </div>
                {!session ? (
                  <Link
                    href="/sign-up"
                    className="block px-3 py-2 rounded-lg text-white bg-cyan-600 hover:bg-cyan-500 text-center transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard/profile/${session.user?.id || "me"}`}
                    className="block px-3 py-2 rounded-lg text-white bg-cyan-600 hover:bg-cyan-500 text-center transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
