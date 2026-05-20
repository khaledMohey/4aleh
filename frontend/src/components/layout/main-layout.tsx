"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useApp } from "@/contexts/app-context";
import { cn } from "@/lib/utils";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useApp();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className={cn("transition-all duration-300", sidebarOpen ? "mr-64" : "mr-20")}>
        <Header />
        <main className="p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
