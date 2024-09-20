"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";

interface NavLinkProps {
  href: string;
  iconName: keyof typeof Icons;
  title: string;
}

export default function NavLink({ href, iconName, title }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const Icon = Icons[iconName] as React.ComponentType<LucideProps>;

  return (
    <Link
      href={href}
      className={`text-primary hover:text-primary-hover flex justify-center items-center w-12 h-12 rounded-md transition-all duration-200 ${
        isActive
          ? "border-2 border-primary"
          : "border-2 border-transparent hover:border-primary hover:border-opacity-50"
      }`}
      title={title}
    >
      <Icon size={24} />
    </Link>
  );
}
