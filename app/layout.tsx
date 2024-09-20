"use client";
import { EnvVarWarning } from "@/components/env-var-warning";
import { HeaderAuth } from "@/components/header-auth";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Link from "next/link";
import NavLink from "@/components/NavLink";
import "./globals.css";
import { Roboto } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { PresenceProvider } from "./components/PresenceContext";
import "@/styles/stream-chat-custom-theme.css";
import { useNotifications } from "./hooks/useNotifications";

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
                <div className="h-full flex items-center justify-between px-4">
                  <Link
                    href="/"
                    className="text-2xl font-bold font-display text-gray-900 dark:text-white"
                  >
                    Minigram
                  </Link>
                  <div className="flex items-center gap-4">
                    {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                  </div>
                </div>
              </header>

              <div className="flex flex-1 pt-16">
                {/* Left Navigation */}
                <nav className="w-16 border-r border-border fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background flex flex-col">
                  <ul className="flex-1 flex flex-col items-center space-y-4 pt-4">
                    <li>
                      <NavLink href="/" iconName="Home" title="Home" />
                    </li>
                    <li>
                      <NavLink
                        href="/tasks"
                        iconName="CheckSquare"
                        title="Tasks"
                      />
                    </li>
                    <li>
                      <NavLink
                        href="/notifications"
                        iconName="Bell"
                        title="Notifications"
                      />
                    </li>
                    <li>
                      <NavLink href="/teams" iconName="Users" title="Teams" />
                    </li>
                    <li>
                      <NavLink
                        href="/profile"
                        iconName="User"
                        title="Profile"
                      />
                    </li>
                  </ul>
                  <div className="w-full mt-auto">
                    <hr className="border-t border-border mx-2 mb-4" />
                    <ul className="flex flex-col items-center pb-4">
                      <li>
                        <NavLink
                          href="/settings"
                          iconName="Settings"
                          title="Settings"
                        />
                      </li>
                    </ul>
                  </div>
                </nav>
                {/* Main Content */}
                <main className="flex-1 flex flex-col ml-16 p-4 bg-gray-100 dark:bg-gray-900">
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
