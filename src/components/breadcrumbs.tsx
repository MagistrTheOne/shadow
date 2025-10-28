"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href: string;
}

export const Breadcrumbs = () => {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard' }
    ];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip dashboard segment as it's already added
      if (segment === 'dashboard') return;
      
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        label,
        href: currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

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
        <div key={breadcrumb.href} className="flex items-center space-x-1">
          <ChevronRight className="w-3 h-3 text-gray-500" />
          {index === breadcrumbs.length - 2 ? (
            <span className="text-white font-medium">{breadcrumb.label}</span>
          ) : (
            <Link 
              href={breadcrumb.href}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};
