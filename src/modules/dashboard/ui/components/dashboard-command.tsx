"use client";

import { CommandDialog, CommandInput, CommandItem, CommandList, CommandGroup, CommandSeparator } from "@/components/ui/command";
import { Dispatch, SetStateAction } from "react";
import { trpc } from "@/trpc/client";
import { BotIcon, VideoIcon, CalendarIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export const DashboardCommand = ({ open, setOpen }: Props) => {
    const router = useRouter();

    // Fetch data for search
    const { data: meetings } = trpc.meetings.getMany.useQuery({}, { enabled: open });
    const { data: agents } = trpc.agents.getMany.useQuery(undefined, { enabled: open });

    const handleSelect = (href: string) => {
        setOpen(false);
        router.push(href);
    };

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Search meetings, agents, or navigate..." />
            <CommandList>
                {/* Quick Actions */}
                <CommandGroup heading="Quick Actions">
                    <CommandItem onSelect={() => handleSelect("/meetings/new")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Schedule New Meeting
                    </CommandItem>
                    <CommandItem onSelect={() => handleSelect("/agents/new")}>
                        <BotIcon className="mr-2 h-4 w-4" />
                        Create New Agent
                    </CommandItem>
                    <CommandItem onSelect={() => handleSelect("/pricing")}>
                        <SearchIcon className="mr-2 h-4 w-4" />
                        View Pricing
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                {/* Meetings */}
                {meetings && meetings.length > 0 && (
                    <CommandGroup heading="Meetings">
                        {meetings.slice(0, 5).map((meeting) => (
                            <CommandItem
                                key={meeting.id}
                                onSelect={() => handleSelect(`/meetings/${meeting.id}`)}
                            >
                                <VideoIcon className="mr-2 h-4 w-4" />
                                {meeting.title}
                                <span className="ml-auto text-xs text-muted-foreground">
                                    {meeting.status}
                                </span>
                            </CommandItem>
                        ))}
                        {meetings.length > 5 && (
                            <CommandItem onSelect={() => handleSelect("/meetings")}>
                                <SearchIcon className="mr-2 h-4 w-4" />
                                View all meetings ({meetings.length})
                            </CommandItem>
                        )}
                    </CommandGroup>
                )}

                <CommandSeparator />

                {/* Agents */}
                {agents && agents.length > 0 && (
                    <CommandGroup heading="AI Agents">
                        {agents.slice(0, 5).map((agent) => (
                            <CommandItem
                                key={agent.id}
                                onSelect={() => handleSelect(`/agents/${agent.id}`)}
                            >
                                <BotIcon className="mr-2 h-4 w-4" />
                                {agent.name}
                            </CommandItem>
                        ))}
                        {agents.length > 5 && (
                            <CommandItem onSelect={() => handleSelect("/agents")}>
                                <SearchIcon className="mr-2 h-4 w-4" />
                                View all agents ({agents.length})
                            </CommandItem>
                        )}
                    </CommandGroup>
                )}

                <CommandSeparator />

                {/* Navigation */}
                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => handleSelect("/dashboard")}>
                        <SearchIcon className="mr-2 h-4 w-4" />
                        Dashboard
                    </CommandItem>
                    <CommandItem onSelect={() => handleSelect("/meetings")}>
                        <VideoIcon className="mr-2 h-4 w-4" />
                        All Meetings
                    </CommandItem>
                    <CommandItem onSelect={() => handleSelect("/agents")}>
                        <BotIcon className="mr-2 h-4 w-4" />
                        All Agents
                </CommandItem>
                    <CommandItem onSelect={() => handleSelect("/upgrade")}>
                        <SearchIcon className="mr-2 h-4 w-4" />
                        Subscription
                </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
};