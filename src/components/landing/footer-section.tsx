"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, Mail, Twitter, Github, Linkedin } from "lucide-react";

export const FooterSection = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-gray-300" />
              </div>
              <span className="text-xl font-bold text-white">Shadow AI</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-xs">
              The future of professional meetings with sophisticated AI avatars and enterprise collaboration.
            </p>
            <div className="flex space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white hover:bg-white/10"
                asChild
              >
                <a href="https://twitter.com/MagistrTheOne" target="_blank" rel="noopener noreferrer">
                  <Twitter className="w-4 h-4" />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white hover:bg-white/10"
                asChild
              >
                <a href="https://github.com/MagistrTheOne" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4" />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white hover:bg-white/10"
                asChild
              >
                <a href="https://linkedin.com/in/MagistrTheOne" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/product" className="text-gray-400 hover:text-white transition-colors">
                  Product
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-gray-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/demo" className="text-gray-400 hover:text-white transition-colors">
                  Demo
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="text-gray-400 hover:text-white transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/company" className="text-gray-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/company/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/company/careers" className="text-gray-400 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/company/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/support" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/support/documentation" className="text-gray-400 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/support/api-reference" className="text-gray-400 hover:text-white transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="/support/status" className="text-gray-400 hover:text-white transition-colors">
                  Status
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} Shadow AI. All rights reserved. Created by{" "}
              <span className="text-white font-semibold">@MagistrTheOne</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-gray-400">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <a 
                href="mailto:magistrtheone@gmail.com" 
                className="text-sm hover:text-white transition-colors"
              >
                magistrtheone@gmail.com
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Created by</span>
              <a 
                href="https://github.com/MagistrTheOne" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white font-semibold hover:text-gray-300 transition-colors"
              >
                @MagistrTheOne
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
