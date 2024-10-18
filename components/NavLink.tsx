"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  title: string;
  icon: LucideIcon;
  className?: string;
}

export function NavLink({ href, title, icon: Icon, className }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors",
        className
      )}
    >
      <Icon className="w-5 h-5 mr-2" />
      <span className="flex-grow flex justify-start">{title}</span>
    </Link>
  );
}
