"use client";

import { ShieldAlert } from "lucide-react";

const CONFIRM_WINDOW_MS = 20000;

function fmtClock(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function ConfirmModal({
  alert,
  now,
  onImSafe,
  onSendSos,
}: {
  alert: any;
  now: number;
  onImSafe: () => void;
  onSendSos: () => void;
}) {
  const createdAt = new Date(alert.createdAt).getTime();
  const left = CONFIRM_WINDOW_MS - (now - createdAt);
  const pct = Math.max(0, Math.min(100, (left / CONFIRM_WINDOW_MS) * 100));

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#3C2A2A] bg-[#17101B] p-6 text-center">
        <ShieldAlert size={30} className="mx-auto mb-3 text-[#F09595]" />
        <h3 className="mb-1 text-base font-medium text-[#E7ECF5]">
          {alert.type === "DEVICE" ? alert.event : "Trip is overdue"}
        </h3>
        <p className="mb-4 text-sm text-[#A9B6CE]">
          {alert.type === "DEVICE"
            ? alert.heartRate
              ? `Heart rate ${alert.heartRate} bpm. Are you okay?`
              : "Are you okay?"
            : "You haven't checked out yet. Are you okay?"}
        </p>
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-[#2B1E22]">
          <div
            className="h-full rounded-full bg-[#F09595] transition-[width] duration-1000 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mb-5 text-xs text-[#8FA0BF]">
          Escalating to your trusted contacts in {fmtClock(Math.max(left, 0))}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onImSafe}
            className="flex-1 rounded-lg bg-[#1D9E75] py-2.5 text-sm font-medium text-[#04342C] transition hover:bg-[#25B686]"
          >
            I&apos;m safe
          </button>
          <button
            onClick={onSendSos}
            className="flex-1 rounded-lg bg-[#A32D2D] py-2.5 text-sm font-medium text-white transition hover:bg-[#8A2626]"
          >
            Send SOS
          </button>
        </div>
      </div>
    </div>
  );
}
