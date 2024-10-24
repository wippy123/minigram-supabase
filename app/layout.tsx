"use client";
import { EnvVarWarning } from "@/components/env-var-warning";
import { HeaderAuth } from "@/components/header-auth";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Link from "next/link";
import { NavLink } from "@/components/NavLink";
import "./globals.css";
import { Roboto } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { PresenceProvider } from "./components/PresenceContext";
import "@/styles/stream-chat-custom-theme.css";
import { useNotifications } from "./hooks/useNotifications";
import {
  LayoutDashboard,
  Video,
  BarChart2,
  Settings,
  PlusCircle,
  Palette,
} from "lucide-react";
import Image from "next/image";
import { MinigraphSearch } from "@/components/MinigraphSearch";

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useNotifications();

  return (
    <html lang="en" suppressHydrationWarning className={roboto.className}>
      <body className="bg-background text-foreground">
        <ThemeProvider>
          <PresenceProvider>
            <div className="flex flex-col min-h-screen bg-background">
              {/* Top Navigation */}
              <header className="border-b border-border h-16 w-full fixed top-0 left-0 z-10 bg-background dark:bg-gray-900">
                <div className="h-full flex items-center justify-between px-4 max-w-7xl mx-auto">
                  <Link
                    href="/"
                    className="text-2xl font-bold font-display text-gray-900 dark:text-white"
                  >
                    Minigram
                  </Link>
                  <div className="flex-1 max-w-md mx-4 flex justify-center">
                    <MinigraphSearch />
                  </div>
                  <div className="flex items-center gap-4">
                    {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                  </div>
                </div>
              </header>

              <div className="flex flex-1 pt-16">
                {/* Left Navigation */}
                <nav className="w-44 border-r border-border fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background flex flex-col">
                  {/* Avatar space */}
                  <div className="flex justify-center items-center py-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden">
                      <Image
                        src="/Minigram.png" // Replace with your actual avatar image path
                        alt="User Avatar"
                        width={80}
                        height={80}
                      />
                    </div>
                  </div>
                  <ul className="flex-1 flex flex-col space-y-1 pt-4 px-2">
                    <li>
                      <NavLink
                        href="/"
                        title="Overview"
                        icon={LayoutDashboard}
                      />
                    </li>
                    <li>
                      <NavLink
                        href="/minigraphs"
                        title="Content"
                        icon={Video}
                      />
                    </li>
                    <li>
                      <NavLink
                        href="/create-minigram-app"
                        title="Create"
                        icon={PlusCircle}
                      />
                    </li>
                    <li>
                      <NavLink
                        href="/analytics"
                        title="Analytics"
                        icon={BarChart2}
                      />
                    </li>
                    <li>
                      <NavLink
                        href="/branding"
                        title="Branding"
                        icon={Palette}
                      />
                    </li>
                  </ul>
                  <div className="w-full mt-auto">
                    <hr className="border-t border-border mx-2 mb-4" />
                    <ul className="flex flex-col px-2 pb-4">
                      <li>
                        <NavLink
                          href="/settings"
                          title="Settings"
                          icon={Settings}
                        />
                      </li>
                    </ul>
                  </div>
                </nav>
                {/* Main Content */}
                <main className="flex-1 flex flex-col ml-44 p-4 bg-gray-100 dark:bg-gray-900">
                  {/* Page Content */}
                  <div className="flex-1">
                    <div className="max-w-5xl mx-auto">{children}</div>
                  </div>
                </main>
              </div>
            </div>
          </PresenceProvider>
        </ThemeProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
