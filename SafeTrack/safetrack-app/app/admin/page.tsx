"use client";

import { useEffect, useState } from "react";
import { Siren } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import NavTabs from "@/components/NavTabs";
import StatusPill from "@/components/StatusPill";

// Security Center: the operator-facing dashboard from PRD step 15.
// Shows live counts and lets an operator resolve active alerts.
export default function AdminPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);

  async function load() {
    const [alertsRes, tripsRes] = await Promise.all([
      fetch("/api/alerts?status=ACTIVE"),
      fetch("/api/trips"),
    ]);
    if (alertsRes.ok) setAlerts(await alertsRes.json());
    if (tripsRes.ok) setTrips(await tripsRes.json());
  }

  useEffect(() => {
    load();
    const poll = setInterval(load, 2000);
    return () => clearInterval(poll);
  }, []);

  async function resolve(alertId: string) {
    await fetch(`/api/alerts/${alertId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "RESOLVE" }),
    });
    load();
  }

  const stats = [
    { label: "Active trips", value: trips.filter((t) => t.status !== "COMPLETED").length },
    { label: "Overdue trips", value: trips.filter((t) => t.status === "OVERDUE").length },
    { label: "Active alerts", value: alerts.length },
    { label: "SOS alerts", value: alerts.filter((a) => a.type === "SOS").length },
  ];

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <AppHeader userName="Security" />
      <NavTabs />

      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-panel p-3">
            <p className="text-xs text-[#8FA0BF]">{s.label}</p>
            <p className="mt-1 text-xl font-medium text-[#E7ECF5]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {alerts.length === 0 && (
          <div className="rounded-2xl border border-border bg-panel p-6 text-sm text-[#8FA0BF]">
            No active alerts. Everything is quiet.
          </div>
        )}

        {alerts.map((a) => (
          <div key={a.id} className="rounded-2xl border border-[#3C2A2A] bg-[#1B1216] p-6">
            <StatusPill tone="danger">
              <Siren size={13} /> High priority
            </StatusPill>
            <h3 className="mb-1 mt-3 text-base font-medium text-[#E7ECF5]">
              {a.trip.user.name} &mdash; {a.type === "SOS" ? "SOS" : a.event}
            </h3>
            <div className="mt-3 space-y-1.5 text-sm text-[#C6D2E8]">
              <p>
                {a.trip.vehicleColor} {a.trip.vehicleMake} {a.trip.vehicleModel} &middot;{" "}
                {a.trip.plateNumber}
              </p>
              <p>Last location: {a.trip.fromLocation}</p>
              <p>Destination: {a.trip.toLocation}</p>
              {a.heartRate && <p>Heart rate: {a.heartRate} bpm</p>}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="rounded-lg border border-[#2B3752] px-3 py-2 text-sm text-[#8FA0BF]">
                View trip
              </button>
              <button
                onClick={() => resolve(a.id)}
                className="rounded-lg bg-[#1D9E75] px-3 py-2 text-sm font-medium text-[#04342C] transition hover:bg-[#25B686]"
              >
                Resolve
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
