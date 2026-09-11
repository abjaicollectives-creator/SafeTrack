"use client";

import { useState } from "react";
import { Siren } from "lucide-react";

export default function SosSentPanel({
  trip,
  onCancel,
}: {
  trip: any;
  onCancel: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="rounded-2xl border border-[#3C2A2A] bg-[#1B1216] p-6 text-center">
      <Siren size={28} className="mx-auto mb-2 text-[#F09595]" />
      <h3 className="mb-1 text-base font-medium text-[#E7ECF5]">SOS sent</h3>
      <p className="mb-4 text-sm text-[#A9B6CE]">
        Your trusted contacts have been notified with your last known
        location, {trip.fromLocation}.
      </p>
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="w-full rounded-lg border border-[#2B3752] py-2.5 text-sm text-[#8FA0BF] transition hover:bg-[#221417]"
        >
          Cancel SOS
        </button>
      ) : (
        <div className="rounded-lg border border-[#2B3752] p-3">
          <p className="mb-2 text-xs text-[#A9B6CE]">
            Only cancel if you&apos;re safe. This notifies your contacts that
            the alert was a mistake.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-lg border border-[#2B3752] py-2 text-xs text-[#8FA0BF]"
            >
              Keep alert active
            </button>
            <button
              onClick={onCancel}
              className="flex-1 rounded-lg bg-[#2B3752] py-2 text-xs text-[#E7ECF5]"
            >
              Confirm cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
