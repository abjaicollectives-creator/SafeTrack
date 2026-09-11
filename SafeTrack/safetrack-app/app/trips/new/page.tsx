"use client";

import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import TripForm from "@/components/TripForm";

// Standalone trip-creation page, matching the PRD's /app/trips/new/page.tsx.
// The dashboard also renders TripForm inline when there's no active trip;
// this route is here for direct linking (e.g. from a "start new trip" CTA).
export default function NewTripPage() {
  const router = useRouter();

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <AppHeader userName="David" />
      <TripForm onCreated={() => router.push("/dashboard")} />
    </main>
  );
}
