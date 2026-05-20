"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Menu, Search, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/app-context";
import { api, endpoints } from "@/lib/api";
import Link from "next/link";

export function Header() {
  const { toggleSidebar, globalSearch, setGlobalSearch } = useApp();
  const router = useRouter();

  const { data: unreadCount } = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: async () => {
      const res = await api.get(`${endpoints.notifications}unread_count/`);
      return res.data.count as number;
    },
    refetchInterval: 60000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(globalSearch)}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>
      <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="بحث شامل..."
          className="pr-10"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
        />
      </form>
      <div className="mr-auto flex items-center gap-2">
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {(unreadCount ?? 0) > 0 && (
              <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                {unreadCount}
              </span>
            )}
          </Button>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
