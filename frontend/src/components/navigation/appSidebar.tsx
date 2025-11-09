"use client";

import { NavFavorites } from "./navFavorites";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "../ui/sidebar";
import { Command } from "lucide-react";
import { TeamSwitcher } from "./teamSwitcher";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { IconWritingFilled } from "@tabler/icons-react";
import { Link } from "react-router";
import { useChatStore } from "../../store/chatStore";

// This is sample data.
const data = {
  teams: [
    {
      name: "Scribe",
      logo: Command,
      plan: "Enterprise",
    },
  ],
  favorites: [
    {
      id: 2,
      title: "C Slab Allocator Explained Step-by-Step Guide",
      start_timestamp: "2025-11-05T09:20:33.900799Z",
      emoji: "🥞",
      status: "ended",
      url: "",
    },
    {
      id: 1,
      title: "Zig Scheduler Step-by-Step Guide",
      start_timestamp: "2025-11-05T09:17:23.641544Z",
      status: "active",
      emoji: "📆",
      url: "",
    },
  ],
};

export interface Conversation {
  id: number;
  title: string;
  start_timestamp: string;
  emoji: string | null;
  status: string;
  url: string | null;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const conversations = useChatStore((state: any) => state.conversations);
  const fetchConversations = useChatStore(
    (state: any) => state.fetchConversations
  );
  const startNewChat = useChatStore((state: any) => state.startNewChat);

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        <Link className="w-full mt-2 " to={"/"}>
          <Button
            onClick={startNewChat}
            className="w-full bg-purple-700 dark:text-white"
          >
            <IconWritingFilled /> New Chat
          </Button>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {conversations && <NavFavorites favorites={conversations} />}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
