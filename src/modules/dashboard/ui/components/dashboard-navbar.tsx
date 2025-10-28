"use client";

import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import {
  PanelLeftCloseIcon,
  PanelLeftIcon,
  SearchIcon,
  Settings,
} from "lucide-react";
import { DashboardCommand } from "./dashboard-command";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SystemStatus } from "./system-status";
import { Notifications } from "./dashboard-notifications";
import { useCommandState } from "@/stores/dashboard-store";

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

      <nav className="flex items-center gap-x-3 px-4 py-2 border-b border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_0_25px_-10px_rgba(56,189,248,0.3)] transition-all">
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
          <Notifications />
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0 text-gray-400 hover:text-cyan-300 hover:bg-cyan-400/10 transition-all"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Command palette */}
        <Button
          className="h-8 w-[200px] justify-start font-normal text-gray-300 hover:text-white border-white/20 hover:border-cyan-400/20 hover:bg-cyan-400/10 text-sm transition-all"
          variant="outline"
          size="sm"
          onClick={openCommand}
          aria-haspopup="dialog"
          aria-expanded={commandOpen}
          aria-controls="dashboard-command"
          title="Open command palette (⌘K / Ctrl+K / Alt+K)"
        >
          <SearchIcon className="mr-2 size-3" />
          <span className="truncate">Search...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-4 select-none items-center gap-1 border border-white/20 bg-black/40 px-1 font-mono text-[9px] font-medium text-gray-300">
            <span className="text-[8px]">⌘</span>K
          </kbd>
        </Button>
      </nav>
    </>
  );
};
