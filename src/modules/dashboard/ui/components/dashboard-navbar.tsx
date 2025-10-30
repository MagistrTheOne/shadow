"use client";

import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import {
  PanelLeftCloseIcon,
  PanelLeftIcon,
  SearchIcon,
  Bell,
} from "lucide-react";
import { DashboardCommand } from "./dashboard-command";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SystemStatus } from "./system-status";
import { useCommandState } from "@/stores/dashboard-store";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";

function isEditingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || el.isContentEditable;
}

function isOpenCommandCombo(e: KeyboardEvent) {
  const isK = e.code === "KeyK" || e.key.toLowerCase() === "k";
  if (!isK) return false;
  return e.altKey || e.metaKey || e.ctrlKey;
}

export const DashboardNavbar = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const { commandOpen, setCommandOpen, toggleCommand } = useCommandState();
  const { data: unreadCount } = trpc.notifications.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const router = useRouter();

  const openCommand = useCallback(() => setCommandOpen(true), [setCommandOpen]);
  const closeCommand = useCallback(() => setCommandOpen(false), [setCommandOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || isEditingTarget(e.target)) return;

      if (isOpenCommandCombo(e)) {
        e.preventDefault();
        toggleCommand();
        return;
      }

      if (e.key === "Escape" && commandOpen) {
        e.preventDefault();
        closeCommand();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [commandOpen, closeCommand, toggleCommand]);

  return (
    <>
      <DashboardCommand
        open={commandOpen}
        setOpen={(value) =>
          typeof value === "function"
            ? setCommandOpen(value(commandOpen))
            : setCommandOpen(value)
        }
      />

      <nav className="dashboard-surface sticky top-0 z-20 flex items-center gap-x-3 px-4 py-2 border-b transition-all">
        {/* Sidebar toggle */}
        <Button
          className="size-8 border-white/20 text-white hover:bg-cyan-400/10 hover:border-cyan-400/20 transition-all"
          variant="outline"
          size="sm"
          onClick={toggleSidebar}
          aria-label={
            state === "collapsed" || isMobile ? "Open sidebar" : "Close sidebar"
          }
          title={
            state === "collapsed" || isMobile ? "Open sidebar" : "Close sidebar"
          }
        >
          {state === "collapsed" || isMobile ? (
            <PanelLeftIcon className="size-4" />
          ) : (
            <PanelLeftCloseIcon className="size-4" />
          )}
        </Button>

        {/* Breadcrumbs */}
        <div className="flex-1 min-w-0">
          <Breadcrumbs />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-x-1">
          <SystemStatus />
          <Button
            variant="ghost"
            size="sm"
            className="relative size-8 p-0 text-gray-400 hover:text-cyan-300 hover:bg-cyan-400/10 transition-all"
            title="Notifications"
            onClick={() => router.push("/dashboard/notifications")}
          >
            <Bell className="w-4 h-4" />
            {unreadCount && unreadCount.count > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                {unreadCount.count}
              </span>
            )}
          </Button>
        </div>

        {/* Command palette */}
        <Button
          className="h-8 w-[160px] justify-start font-normal text-gray-300 hover:text-white border-white/20 hover:border-cyan-400/20 hover:bg-cyan-400/10 text-sm transition-all"
          variant="outline"
          size="sm"
          onClick={openCommand}
          aria-haspopup="dialog"
          aria-expanded={commandOpen}
          aria-controls="dashboard-command"
          title="Open command palette"
        >
          <SearchIcon className="mr-2 size-3" />
          <span className="truncate">Search…</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-4 select-none items-center gap-1 border border-white/20 bg-black/40 px-1 font-mono text-[9px] font-medium text-gray-300">
            <span className="text-[8px]">⌘</span>K
          </kbd>
        </Button>
      </nav>
    </>
  );
};
