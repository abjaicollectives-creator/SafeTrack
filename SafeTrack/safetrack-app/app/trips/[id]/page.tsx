"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import TripCard from "@/components/TripCard";

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let active = true;
    async function load() {
      const res = await fetch(`/api/trips/${params.id}`);
      if (res.ok && active) setTrip(await res.json());
    }
    load();
    const poll = setInterval(load, 2000);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      active = false;
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [params.id]);

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <AppHeader userName="David" />
      {trip && (
        <>
          <h2 className="mb-4 text-sm text-[#8FA0BF]">Trip #{trip.id}</h2>
          <TripCard trip={trip} now={now} onCheckout={() => {}} onSimulateFall={() => {}} onSos={() => {}} />
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-[#E7ECF5]">History</h3>
            <ul className="space-y-2 text-sm text-[#8FA0BF]">
              {trip.alerts?.map((a: any) => (
                <li key={a.id} className="rounded-lg border border-border bg-panel px-3 py-2">
                  {a.event} &middot; {a.status}
                </li>
              ))}
              {trip.alerts?.length === 0 && <li>No alerts on this trip.</li>}
            </ul>
          </div>
        </>
      )}
      {!trip && <p className="text-sm text-[#8FA0BF]">Loading…</p>}
    </main>
  );
}
