"use client";

import * as React from "react";

import { DropdownMenu, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { IconSearch } from "@tabler/icons-react";
import { Link } from "react-router";
import { ModeToggle } from "../ui/modeToggle";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  const [activeTeam, _] = React.useState(teams[0]);

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center">
        <Link
          to={"/"}
          className="w-fit flex gap-2 items-center px-1.5 hover:bg-transparent space-grotesk-font"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-6 items-center justify-center rounded-md">
            {" "}
            <activeTeam.logo className="size-4" />
          </div>
          <span className="truncate text-xl font-medium">
            {activeTeam.name}
          </span>
          {/* <ChevronDown className="opacity-50" /> */}
        </Link>

        <ModeToggle />
        <a href={"/search"}>
          <IconSearch className="size-5" />
        </a>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
