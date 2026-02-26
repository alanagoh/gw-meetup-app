"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/discover", label: "Discover", icon: "✦" },
  { href: "/waves",    label: "Waves",    icon: "👋" },
  { href: "/connections", label: "Connected", icon: "🤝" },
  { href: "/profile",  label: "Profile",  icon: "⬡" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] flex items-center justify-around px-2 pb-safe"
      style={{
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-subtle)",
        paddingBottom: "max(env(safe-area-inset-bottom), 12px)",
        paddingTop: "12px",
      }}
    >
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center gap-0.5 px-4 transition-opacity"
            style={{ opacity: active ? 1 : 0.45 }}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span
              className="text-[10px] font-medium tracking-wide"
              style={{ color: active ? "var(--accent-primary)" : "var(--text-secondary)" }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
