"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Siren, RotateCcw } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import NavTabs from "@/components/NavTabs";
import StatusPill from "@/components/StatusPill";
import TripCard from "@/components/TripCard";
import TripForm from "@/components/TripForm";
import ConfirmModal from "@/components/ConfirmModal";
import SosSentPanel from "@/components/SosSentPanel";

// Poll interval for picking up server-side engine ticks (overdue /
// auto-escalation). Short enough to feel live for a hackathon demo.
const POLL_MS = 2000;

export default function DashboardPage() {
  const [trip, setTrip] = useState<any>(null);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/trips");
    if (!res.ok) return;
    const trips = await res.json();
    const current = trips.find((t: any) => t.status !== "COMPLETED") ?? trips[0] ?? null;
    setTrip(current);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const poll = setInterval(refresh, POLL_MS);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [refresh]);

  const pendingAlert = trip?.alerts?.find((a: any) => a.status === "PENDING_CONFIRM");
  const activeSosAlert = trip?.alerts?.find(
    (a: any) => a.type === "SOS" && a.status === "ACTIVE"
  );

  async function handleCheckout() {
    if (!trip) return;
    await fetch(`/api/trips/${trip.id}/checkout`, { method: "POST" });
    refresh();
  }

  async function handleSimulateFall() {
    if (!trip) return;
    await fetch("/api/device-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tripId: trip.id,
        deviceType: "smartwatch",
        eventType: "FALL",
        heartRate: 142,
        latitude: 9.0765,
        longitude: 7.3986,
      }),
    });
    refresh();
  }

  async function handleSos() {
    if (!trip) return;
    await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripId: trip.id, type: "SOS", event: "Manual SOS" }),
    });
    refresh();
  }

  async function handleCancelSos() {
    if (!activeSosAlert) return;
    await fetch(`/api/alerts/${activeSosAlert.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "RESOLVE" }),
    });
    refresh();
  }

  async function handleImSafe() {
    if (!pendingAlert) return;
    await fetch(`/api/alerts/${pendingAlert.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CONFIRM_SAFE" }),
    });
    refresh();
  }

  async function handleEscalateFromModal() {
    if (!pendingAlert) return;
    await fetch(`/api/alerts/${pendingAlert.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ESCALATE" }),
    });
    refresh();
  }

  const tone = !trip || trip.status === "COMPLETED"
    ? "safe"
    : trip.status === "ACTIVE"
    ? "safe"
    : trip.status === "OVERDUE"
    ? "warn"
    : "danger";

  const label = !trip
    ? "No trip in progress"
    : trip.status === "ACTIVE"
    ? "No active alerts"
    : trip.status === "OVERDUE"
    ? "Confirming your safety"
    : trip.status === "EMERGENCY"
    ? "Emergency alert active"
    : "Trip completed safely";

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <AppHeader userName="David" />
      <NavTabs />

      {!loading && (
        <div className="space-y-5">
          <div>
            <p className="text-sm text-[#8FA0BF]">Your safety status</p>
            <div className="mt-1">
              <StatusPill tone={tone as any}>
                {tone === "safe" && <ShieldCheck size={13} />}
                {tone === "warn" && <ShieldAlert size={13} />}
                {tone === "danger" && <Siren size={13} />}
                {label}
              </StatusPill>
            </div>
          </div>

          {activeSosAlert && trip && (
            <SosSentPanel trip={trip} onCancel={handleCancelSos} />
          )}

          {!activeSosAlert && trip && trip.status !== "COMPLETED" && (
            <TripCard
              trip={trip}
              now={now}
              onCheckout={handleCheckout}
              onSimulateFall={handleSimulateFall}
              onSos={handleSos}
            />
          )}

          {!activeSosAlert && trip && trip.status === "COMPLETED" && (
            <div className="rounded-2xl border border-border bg-panel p-6">
              <div className="mb-4 flex items-center gap-2 text-[#5DCAA5]">
                <ShieldCheck size={18} />
                <span className="text-sm">
                  Arrived at {trip.toLocation}. Trusted contacts were notified.
                </span>
              </div>
              <button
                onClick={() => setTrip(null)}
                className="flex items-center gap-2 rounded-lg border border-[#2B3752] px-3 py-2 text-sm text-[#8FA0BF] transition hover:bg-[#132242]"
              >
                <RotateCcw size={14} /> Start a new trip
              </button>
            </div>
          )}

          {!trip && <TripForm onCreated={refresh} />}

          {pendingAlert && (
            <ConfirmModal
              alert={pendingAlert}
              now={now}
              onImSafe={handleImSafe}
              onSendSos={handleEscalateFromModal}
            />
          )}
        </div>
      )}
    </main>
  );
}
