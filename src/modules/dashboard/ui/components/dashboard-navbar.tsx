"use client";

import { useEffect, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftCloseIcon, PanelLeftIcon, SearchIcon } from "lucide-react";
import { DashboardCommand } from "./dashboard-command";

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

      <nav className="flex items-center gap-x-2 px-4 py-3 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <Button
          className="size-9 border-white/20 text-white hover:bg-white/10"
          variant="outline"
          onClick={toggleSidebar}
          aria-label={state === "collapsed" || isMobile ? "Open sidebar" : "Close sidebar"}
          title={state === "collapsed" || isMobile ? "Open sidebar" : "Close sidebar"}
        >
          {(state === "collapsed" || isMobile)
            ? <PanelLeftIcon className="size-4" />
            : <PanelLeftCloseIcon className="size-4" />}
        </Button>

        <Button
          className="h-9 w-[260px] justify-start font-normal text-gray-300 hover:text-white border-white/20 hover:bg-white/10"
          variant="outline"
          size="sm"
          onClick={openCommand}
          aria-haspopup="dialog"
          aria-expanded={commandOpen}
          aria-controls="dashboard-command"
          title="Open command palette (⌘K / Ctrl+K / Alt+K)"
        >
          <SearchIcon className="mr-2 size-4" />
          Search
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 border border-white/20 bg-black/40 px-1.5 font-mono text-[10px] font-medium text-gray-300">
            <span className="text-xs">⌘</span>K
            <span className="mx-1 opacity-60">/</span>
            Ctrl K
            <span className="mx-1 opacity-60">/</span>
            Alt K
          </kbd>
        </Button>
      </nav>
    </>
  );
};
