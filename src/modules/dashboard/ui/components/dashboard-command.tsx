"use client";

import {
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
  CommandSeparator,
  CommandEmpty,
} from "@/components/ui/command";
import { Dispatch, SetStateAction } from "react";
import { trpc } from "@/trpc/client";
import {
  BotIcon,
  VideoIcon,
  CalendarIcon,
  SearchIcon,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const DashboardCommand = ({ open, setOpen }: Props) => {
  const router = useRouter();

  // Load data only when open
  const { data: meetings } = trpc.meetings.getMany.useQuery({}, { enabled: open });
  const { data: agents } = trpc.agents.getMany.useQuery(undefined, { enabled: open });

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      className="backdrop-blur-2xl bg-black/80 border border-cyan-400/20 shadow-[0_0_60px_-15px_rgba(56,189,248,0.3)]"
    >
      <CommandInput
        placeholder="Search meetings, agents, or navigate..."
        className="border-none bg-transparent text-white placeholder:text-gray-400 focus:ring-0"
      />

      <CommandList className="text-gray-200">
        <CommandEmpty className="py-6 text-center text-gray-500">
          No results found
        </CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => handleSelect("/meetings/new")}
            className="hover:bg-cyan-400/10"
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-cyan-400" />
            Schedule New Meeting
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/agents/new")}
            className="hover:bg-cyan-400/10"
          >
            <BotIcon className="mr-2 h-4 w-4 text-cyan-400" />
            Create New Agent
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/pricing")}
            className="hover:bg-cyan-400/10"
          >
            <Zap className="mr-2 h-4 w-4 text-cyan-400" />
            View Pricing
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="bg-white/10" />

        {/* Meetings */}
        {meetings && meetings.length > 0 && (
          <CommandGroup heading="Meetings">
            {meetings.slice(0, 5).map((meeting) => (
              <CommandItem
                key={meeting.id}
                onSelect={() => handleSelect(`/meetings/${meeting.id}`)}
                className="hover:bg-cyan-400/10"
              >
                <VideoIcon className="mr-2 h-4 w-4 text-gray-400" />
                <span className="truncate">{meeting.title}</span>
                <span className="ml-auto text-xs text-gray-500">
                  {meeting.status}
                </span>
              </CommandItem>
            ))}
            {meetings.length > 5 && (
              <CommandItem
                onSelect={() => handleSelect("/meetings")}
                className="text-gray-400 hover:text-white hover:bg-cyan-400/10"
              >
                <SearchIcon className="mr-2 h-4 w-4" />
                View all meetings ({meetings.length})
              </CommandItem>
            )}
          </CommandGroup>
        )}

        <CommandSeparator className="bg-white/10" />

        {/* Agents */}
        {agents && agents.length > 0 && (
          <CommandGroup heading="AI Agents">
            {agents.slice(0, 5).map((agent) => (
              <CommandItem
                key={agent.id}
                onSelect={() => handleSelect(`/agents/${agent.id}`)}
                className="hover:bg-cyan-400/10"
              >
                <BotIcon className="mr-2 h-4 w-4 text-gray-400" />
                <span>{agent.name}</span>
              </CommandItem>
            ))}
            {agents.length > 5 && (
              <CommandItem
                onSelect={() => handleSelect("/agents")}
                className="text-gray-400 hover:text-white hover:bg-cyan-400/10"
              >
                <SearchIcon className="mr-2 h-4 w-4" />
                View all agents ({agents.length})
              </CommandItem>
            )}
          </CommandGroup>
        )}

        <CommandSeparator className="bg-white/10" />

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => handleSelect("/dashboard")}
            className="hover:bg-cyan-400/10"
          >
            <SearchIcon className="mr-2 h-4 w-4 text-gray-400" />
            Dashboard
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/meetings")}
            className="hover:bg-cyan-400/10"
          >
            <VideoIcon className="mr-2 h-4 w-4 text-gray-400" />
            All Meetings
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/agents")}
            className="hover:bg-cyan-400/10"
          >
            <BotIcon className="mr-2 h-4 w-4 text-gray-400" />
            All Agents
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/upgrade")}
            className="hover:bg-cyan-400/10"
          >
            <Zap className="mr-2 h-4 w-4 text-gray-400" />
            Subscription
          </CommandItem>
        </CommandGroup>
      </CommandList>

      <style jsx global>{`
        [cmdk-dialog] {
          backdrop-filter: blur(24px);
        }
        [cmdk-group-heading] {
          color: #94a3b8;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        [cmdk-item] {
          transition: background 0.15s ease, color 0.15s ease;
        }
      `}</style>
    </CommandDialog>
  );
};
