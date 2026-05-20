"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Users,
  Contact,
  CalendarDays,
  Receipt,
  FileBarChart,
  Bell,
  Handshake,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/app-context";

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/chalets", label: "الشاليهات", icon: Home },
  { href: "/owners", label: "إيجار الملاك", icon: Handshake },
  { href: "/bookings", label: "حجوزات العملاء", icon: Users },
  { href: "/customers", label: "العملاء", icon: Contact },
  { href: "/expenses", label: "المصروفات", icon: Receipt },
  { href: "/calendar", label: "التقويم", icon: CalendarDays },
  { href: "/reports", label: "التقارير", icon: FileBarChart },
  { href: "/notifications", label: "الإشعارات", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useApp();

  return (
    <aside
      className={cn(
        "fixed right-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
          ش
        </div>
        {sidebarOpen && (
          <div>
            <p className="font-bold text-sm">نظام إدارة الشاليهات</p>
            <p className="text-xs text-white/60">Chalet Management</p>
          </div>
        )}
      </div>
      <nav className="space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
              {sidebarOpen && isActive && <ChevronRight className="mr-auto h-4 w-4" />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
