"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePageState } from "@/stores/dashboard-store";

export const Breadcrumbs = () => {
  const { breadcrumbs } = usePageState();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm">
      <Link 
        href="/dashboard" 
        className="text-gray-400 hover:text-white transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {breadcrumbs.slice(1).map((breadcrumb, index) => (
        <div key={breadcrumb.href || index} className="flex items-center space-x-1">
          <ChevronRight className="w-3 h-3 text-gray-500" />
          {index === breadcrumbs.length - 2 ? (
            <span className="text-white font-medium">{breadcrumb.label}</span>
          ) : (
            breadcrumb.href ? (
              <Link 
                href={breadcrumb.href}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {breadcrumb.label}
              </Link>
            ) : (
              <span className="text-white font-medium">{breadcrumb.label}</span>
            )
          )}
        </div>
      ))}
    </nav>
  );
};
