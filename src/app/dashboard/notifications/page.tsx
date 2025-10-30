"use client";

import { NotificationsPanel } from "@/modules/dashboard/ui/components/notifications-panel";

export default function NotificationsPage() {
  return (
    <div className="dashboard-root px-4 md:px-8 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-high-contrast">Notifications</h1>
          <p className="text-sm text-muted-strong mt-1">Manage your notifications</p>
        </header>
        <NotificationsPanel />
      </div>
    </div>
  );
}

