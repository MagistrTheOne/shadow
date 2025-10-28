"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePageState } from "@/stores/dashboard-store";

export const BreadcrumbManager = () => {
  const pathname = usePathname();
  const { setBreadcrumbs, setCurrentPage } = usePageState();

  useEffect(() => {
    const generateBreadcrumbs = () => {
      const segments = pathname.split('/').filter(Boolean);
      const breadcrumbs = [{ label: 'Dashboard', href: '/dashboard' }];

      if (segments.length === 1 && segments[0] === 'dashboard') {
        setCurrentPage('Dashboard');
        setBreadcrumbs(breadcrumbs);
        return;
      }

      let currentPath = '';
      segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        
        if (segment === 'dashboard') {
          return; // Skip dashboard segment
        }

        const label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        if (index === segments.length - 1) {
          // Last segment - no href
          breadcrumbs.push({ label });
          setCurrentPage(label);
        } else {
          breadcrumbs.push({ label, href: currentPath });
        }
      });

      setBreadcrumbs(breadcrumbs);
    };

    generateBreadcrumbs();
  }, [pathname, setBreadcrumbs, setCurrentPage]);

  return null; // This component doesn't render anything
};
