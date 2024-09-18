import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { HeaderAuth } from "@/components/header-auth";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Link from "next/link";
import NavLink from "@/components/NavLink";
import "./globals.css";
import { Roboto } from "next/font/google";
import { Toaster } from "react-hot-toast";

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Minigram",
  description: "Minigram is an AI-powered version of Monogram",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={roboto.className}>
      <body className="bg-background text-foreground">
        <ThemeProvider>
          <div className="flex flex-col min-h-screen bg-background">
            {/* Top Navigation */}
            <header className="border-b border-border h-16 w-full fixed top-0 left-0 z-10 bg-background">
              <div className="h-full flex items-center justify-between px-4">
                <Link href="/" className="text-2xl font-bold font-display">
                  Minigram
                </Link>
                <div className="flex items-center gap-4">
                  <DeployButton />
                  {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                </div>
              </div>
            </header>

            <div className="flex flex-1 pt-16">
              {/* Left Navigation */}
              <nav className="w-16 border-r border-border fixed left-0 top-16 h-full bg-background">
                <ul className="flex flex-col items-center space-y-4 pt-4">
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
                      href="/account-settings"
                      iconName="Settings"
                      title="Account Settings"
                    />
                  </li>
                </ul>
              </nav>
              {/* Main Content */}
              <main className="flex-1 flex flex-col ml-16 p-4 bg-gray-100">
                {/* Page Content */}
                <div className="flex-1">
                  <div className="max-w-5xl mx-auto">{children}</div>
                </div>
              </main>
            </div>
          </div>
        </ThemeProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
