"use client";

import { useEffect, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftCloseIcon, PanelLeftIcon, SearchIcon, Settings } from "lucide-react";
import { DashboardCommand } from "./dashboard-command";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SystemStatus } from "./system-status";
import { Notifications } from "./dashboard-notifications";

function isEditingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || el.isContentEditable;
}

// Комбо: Cmd/Ctrl+K ИЛИ Alt+K
function isOpenCommandCombo(e: KeyboardEvent) {
  const isK = e.code === "KeyK" || e.key.toLowerCase() === "k";
  if (!isK) return false;
  if (e.altKey) return true;                    // Alt+K
  if (e.metaKey || e.ctrlKey) return true;      // Cmd/Ctrl+K
  return false;
}

export const DashboardNavbar = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const [commandOpen, setCommandOpen] = useState(false);

  const openCommand = useCallback(() => setCommandOpen(true), []);
  const closeCommand = useCallback(() => setCommandOpen(false), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;                  
      if (isEditingTarget(e.target)) return;

      // Открыть: Cmd/Ctrl+K или Alt+K
      if (isOpenCommandCombo(e)) {
        e.preventDefault();            
        if (!commandOpen) setCommandOpen(true);
        return;
      }

      // Закрыть: Esc
      if (e.key === "Escape" && commandOpen) {
        e.preventDefault();
        closeCommand();
      }
    };

    document.addEventListener("keydown", onKeyDown, { capture: false });
    return () => document.removeEventListener("keydown", onKeyDown, { capture: false } as any);
  }, [commandOpen, closeCommand]);

  return (
    <>
      <DashboardCommand
        open={commandOpen}
        setOpen={setCommandOpen}
        
      />

      <nav className="flex items-center gap-x-3 px-4 py-2 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <Button
          className="size-8 border-white/20 text-white hover:bg-white/10"
          variant="outline"
          size="sm"
          onClick={toggleSidebar}
          aria-label={state === "collapsed" || isMobile ? "Open sidebar" : "Close sidebar"}
          title={state === "collapsed" || isMobile ? "Open sidebar" : "Close sidebar"}
        >
          {(state === "collapsed" || isMobile)
            ? <PanelLeftIcon className="size-4" />
            : <PanelLeftCloseIcon className="size-4" />}
        </Button>

        {/* Breadcrumbs */}
        <div className="flex-1 min-w-0">
          <Breadcrumbs />
        </div>

        {/* Right side items - compact */}
        <div className="flex items-center gap-x-1">
          <SystemStatus />
          <Notifications />
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        <Button
          className="h-8 w-[200px] justify-start font-normal text-gray-300 hover:text-white border-white/20 hover:bg-white/10 text-sm"
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
