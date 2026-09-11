"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Siren, Radio } from "lucide-react";

const TABS = [
  { href: "/dashboard", label: "Dashboard", icon: ShieldCheck },
  { href: "/alerts", label: "Alerts", icon: Radio },
  { href: "/admin", label: "Security", icon: Siren },
];

export default function NavTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex gap-1 rounded-lg border border-border bg-panel p-1">
      {TABS.map((tab) => {
        const active = pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition ${
              active
                ? "bg-[#1C2536] text-[#E7ECF5]"
                : "text-[#6C7A99] hover:text-[#A9B6CE]"
            }`}
          >
            <tab.icon size={13} /> {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
