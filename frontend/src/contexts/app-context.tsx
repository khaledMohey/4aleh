"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <AppContext.Provider value={{ sidebarOpen, toggleSidebar, globalSearch, setGlobalSearch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
