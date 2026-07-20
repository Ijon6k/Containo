"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  LogOut,
  Sun,
  Moon,
  Monitor,
  PanelLeft,
  PanelLeftClose,
  Rocket,
  Wrench,
  Settings,
} from "lucide-react";
import { useTheme, type Theme } from "@/components/providers/ThemeProvider";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  theme: Theme;
  cycleTheme: () => void;
}

const menuItems = [
  {
    id: "dashboard",
    label: "Containers",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    id: "deploy",
    label: "Deploy",
    icon: Rocket,
    href: "/deploy",
  },
  { id: "backup", label: "Backups", icon: Database, href: "/backups" },
  {
    id: "maintenance",
    label: "Maintenance",
    icon: Wrench,
    href: "/maintenance",
  },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

const themeIcon = (t: Theme) => {
  switch (t) {
    case "dark":
      return Moon;
    case "dim":
      return Monitor;
    case "light":
      return Sun;
  }
};

const themeLabel = (t: Theme) => {
  switch (t) {
    case "dark":
      return "Pitch Black";
    case "dim":
      return "Dim";
    case "light":
      return "Light";
  }
};

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
  onLogout,
  theme,
  cycleTheme,
}: SidebarProps) {
  const pathname = usePathname();
  const ThemeIcon = themeIcon(theme);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={`h-screen flex flex-col bg-surface border-r border-border z-40 fixed left-0 top-0 transition-[width] duration-200 ${
        isCollapsed ? "w-[64px]" : "w-[220px]"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center border-b border-border ${
          isCollapsed ? "justify-center h-[60px]" : "justify-between px-5 h-[60px]"
        }`}
      >
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
            <img
              src="/logo/containologo.webp"
              alt="Containo"
              className="w-6 h-6 object-contain"
            />
            <span className="text-lg font-semibold text-text-primary tracking-tight">
              Containo
            </span>
          </Link>
        )}
        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-md hover:bg-hover text-text-secondary hover:text-text-primary transition-colors ${
            isCollapsed ? "" : ""
          }`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-4 space-y-0.5 ${isCollapsed ? "px-3" : "px-3"}`}>
        {menuItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center rounded-sm transition-colors text-base font-medium ${
                isCollapsed
                  ? "justify-center h-10 w-10 mx-auto"
                  : "gap-3 px-3 h-9"
              } ${
                active
                  ? "bg-brand/10 text-brand"
                  : "text-text-secondary hover:bg-hover hover:text-text-primary"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`p-3 border-t border-border ${isCollapsed ? "space-y-1.5" : "space-y-1"}`}>
        <button
          onClick={cycleTheme}
          className={`flex items-center rounded-sm text-base font-medium text-text-secondary hover:bg-hover hover:text-text-primary transition-colors ${
            isCollapsed
              ? "justify-center h-10 w-10 mx-auto"
              : "w-full gap-3 px-3 h-9"
          }`}
          title={isCollapsed ? themeLabel(theme) : undefined}
          aria-label={`Current theme: ${themeLabel(theme)}. Click to cycle.`}
        >
          <ThemeIcon className="w-[18px] h-[18px] shrink-0" />
          {!isCollapsed && <span>{themeLabel(theme)}</span>}
        </button>

        <button
          onClick={onLogout}
          className={`flex items-center rounded-sm text-base font-medium text-danger hover:bg-danger-bg transition-colors ${
            isCollapsed
              ? "justify-center h-10 w-10 mx-auto"
              : "w-full gap-3 px-3 h-9"
          }`}
          title={isCollapsed ? "Log out" : undefined}
          aria-label="Log out"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!isCollapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}
