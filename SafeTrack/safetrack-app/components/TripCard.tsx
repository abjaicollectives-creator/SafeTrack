"use client";

import { Car, MapPin, Clock, Check, HeartPulse, Siren, ArrowRight } from "lucide-react";

function fmtClock(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function TripCard({
  trip,
  now,
  onCheckout,
  onSimulateFall,
  onSos,
}: {
  trip: any;
  now: number;
  onCheckout: () => void;
  onSimulateFall: () => void;
  onSos: () => void;
}) {
  const etaAt = new Date(trip.expectedArrival).getTime();
  const remaining = etaAt - now;
  const overdueBy = now - etaAt;

  return (
    <div className="rounded-2xl border border-border bg-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#E7ECF5]">
          <Car size={18} />
          <span className="font-medium">
            {trip.vehicleColor} {trip.vehicleMake} {trip.vehicleModel}
          </span>
        </div>
        <span className="text-sm text-[#8FA0BF]">{trip.plateNumber}</span>
      </div>

      <div className="mb-4 flex items-center gap-3 text-sm text-[#C6D2E8]">
        <MapPin size={15} className="text-[#8FA0BF]" />
        <span>{trip.fromLocation}</span>
        <ArrowRight size={13} className="text-[#546080]" />
        <span>{trip.toLocation}</span>
      </div>

      <div className="mb-5 flex items-center gap-2 text-sm text-[#8FA0BF]">
        <Clock size={15} />
        {trip.status === "ACTIVE" && remaining > 0 && (
          <span>Arriving in {fmtClock(remaining)}</span>
        )}
        {trip.status === "ACTIVE" && remaining <= 0 && (
          <span>ETA passed &middot; {fmtClock(overdueBy)} ago</span>
        )}
        {trip.status === "OVERDUE" && (
          <span className="text-[#FAC775]">Overdue by {fmtClock(overdueBy)}</span>
        )}
        {trip.status === "EMERGENCY" && (
          <span className="text-[#F09595]">Emergency in progress</span>
        )}
        {trip.status === "COMPLETED" && (
          <span className="text-[#5DCAA5]">Checked out safely</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          disabled={trip.status !== "ACTIVE" && trip.status !== "OVERDUE"}
          onClick={onCheckout}
          className="flex items-center gap-1.5 rounded-lg border border-[#2B3752] bg-[#132242] px-3 py-2 text-sm text-[#9DC0F8] transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check size={15} /> Check out
        </button>
        <button
          disabled={trip.status === "COMPLETED"}
          onClick={onSimulateFall}
          className="flex items-center gap-1.5 rounded-lg border border-[#2B3752] bg-[#1C1730] px-3 py-2 text-sm text-[#C7B4F2] transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          <HeartPulse size={15} /> Simulate fall
        </button>
        <button
          disabled={trip.status === "COMPLETED"}
          onClick={onSos}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-[#A32D2D] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#8A2626] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Siren size={15} /> SOS
        </button>
      </div>
    </div>
  );
}
