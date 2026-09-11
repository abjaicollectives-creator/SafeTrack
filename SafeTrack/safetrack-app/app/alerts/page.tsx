"use client";

import { useEffect, useState } from "react";
import { Siren, Phone } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import NavTabs from "@/components/NavTabs";
import StatusPill from "@/components/StatusPill";

// Alert Center: a read-only feed for anyone watching a traveler
// (trusted contact perspective). Security operators use /admin instead,
// which adds the ability to resolve alerts.
export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/alerts?status=ACTIVE");
      if (res.ok) setAlerts(await res.json());
    }
    load();
    const poll = setInterval(load, 2000);
    return () => clearInterval(poll);
  }, []);

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <AppHeader userName="Trusted contact" />
      <NavTabs />

      {alerts.length === 0 && (
        <div className="rounded-2xl border border-border bg-panel p-6 text-sm text-[#8FA0BF]">
          No alerts right now. You&apos;ll see this update the moment someone
          you&apos;re watching needs help.
        </div>
      )}

      <div className="space-y-4">
        {alerts.map((a) => (
          <div key={a.id} className="rounded-2xl border border-[#3C2A2A] bg-[#1B1216] p-6">
            <StatusPill tone="danger">
              <Siren size={13} /> High priority
            </StatusPill>
            <h3 className="mb-1 mt-3 text-base font-medium text-[#E7ECF5]">
              {a.trip.user.name} &mdash; {a.type === "SOS" ? "SOS triggered" : a.event}
            </h3>
            <div className="mt-3 space-y-1.5 text-sm text-[#C6D2E8]">
              <p>
                {a.trip.vehicleColor} {a.trip.vehicleMake} {a.trip.vehicleModel} &middot;{" "}
                {a.trip.plateNumber}
              </p>
              <p>Last known location: {a.trip.fromLocation}</p>
              <p>Destination: {a.trip.toLocation}</p>
              {a.heartRate && <p>Heart rate: {a.heartRate} bpm</p>}
            </div>
            <button className="mt-4 flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm text-white">
              <Phone size={14} /> Call {a.trip.user.name}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
