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
    <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-gray-300" />
            </div>
            <span className="text-xl font-bold text-white">Shadow AI</span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link href="/product" className="text-gray-300 hover:text-white transition-colors">
              Product
            </Link>
            <Link href="/features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/demo" className="text-gray-300 hover:text-white transition-colors">
              Demo
            </Link>
            <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
              <Link href="/sign-in">
                Sign In
              </Link>
            </Button>
            <Button className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/30" asChild>
              <Link href="/sign-up">
                Get Started
              </Link>
            </Button>
            <Button className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/30" asChild>
              <Link href="/dashboard">
                Dashboard
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-white/10"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black/60 backdrop-blur-xl rounded-lg mt-2">
              <Link
                href="/product"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Product
              </Link>
              <Link
                href="/features"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/demo"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Demo
              </Link>
              <Link
                href="/pricing"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="px-3 py-2 space-y-2">
                <Button variant="ghost" className="w-full text-white hover:bg-white/10" asChild>
                  <Link href="/sign-in">
                    Sign In
                  </Link>
                </Button>
                <Button className="w-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/30" asChild>
                  <Link href="/sign-up">
                    Get Started
                  </Link>
                </Button>
                <Button className="w-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/30" asChild>
                  <Link href="/dashboard">
                    Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
