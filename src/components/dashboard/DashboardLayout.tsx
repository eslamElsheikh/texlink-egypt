"use client";

import React, { useState } from "react";
import { DashboardSidebar, DashboardUser } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { useRouter } from "next/navigation";

interface DashboardLayoutProps {
  user: DashboardUser;
  currentRole: "ADMIN" | "FACTORY" | "BUYER";
  children: React.ReactNode;
}

export function DashboardLayout({
  user,
  currentRole,
  children,
}: DashboardLayoutProps) {
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleRoleSwitch = async (newRole: "FACTORY" | "BUYER") => {
    try {
      await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: newRole }),
      });
    } catch (err) {
      console.error(err);
    }

    if (newRole === "FACTORY") {
      window.location.href = "/factory/dashboard";
    } else {
      window.location.href = "/buyer/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-row-reverse text-[#17233F] font-sans antialiased">
      {/* 1. Desktop Fixed Sidebar (Right side in RTL) */}
      <div className="hidden lg:block w-64 fixed right-0 top-0 bottom-0 z-30 shadow-sm">
        <DashboardSidebar
          user={user}
          currentRole={currentRole}
          onSwitchRole={handleRoleSwitch}
        />
      </div>

      {/* 2. Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-row-reverse">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] bg-white h-full z-10 shadow-2xl">
            <DashboardSidebar
              user={user}
              currentRole={currentRole}
              onSwitchRole={handleRoleSwitch}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 3. Main Content Container (Padded by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 mr-0 lg:mr-64 transition-all">
        <DashboardHeader
          user={user}
          currentRole={currentRole}
          onSwitchRole={handleRoleSwitch}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
