"use client";

import { useEffect, useState } from "react";

const inputCls =
  "w-full rounded-lg border border-[#2B3752] bg-[#0F1729] px-3 py-2 text-sm text-[#E7ECF5] placeholder:text-[#546080] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[#8FA0BF]">{label}</span>
      {children}
    </label>
  );
}

export default function TripForm({ onCreated }: { onCreated: (trip: any) => void }) {
  const [vehicleType, setVehicleType] = useState("Car");
  const [vehicleMake, setVehicleMake] = useState("Toyota");
  const [vehicleModel, setVehicleModel] = useState("Corolla");
  const [vehicleColor, setVehicleColor] = useState("Black");
  const [plateNumber, setPlateNumber] = useState("ABC-123-XY");
  const [fromLocation, setFromLocation] = useState("Wuse");
  const [toLocation, setToLocation] = useState("Gwarinpa");
  const [etaMin, setEtaMin] = useState(1);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/contacts")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setContacts(data);
        setSelectedContactIds(data.map((c: any) => c.id));
      })
      .catch(() => {});
  }, []);

  const toggleContact = (id: string) => {
    setSelectedContactIds((c) =>
      c.includes(id) ? c.filter((x) => x !== id) : [...c, id]
    );
  };

  const submit = async () => {
    if (!fromLocation.trim() || !toLocation.trim() || !plateNumber.trim()) {
      setError("Fill in the plate number, starting point, and destination.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleType,
          vehicleMake,
          vehicleModel,
          vehicleColor,
          plateNumber,
          fromLocation,
          toLocation,
          expectedArrival: new Date(Date.now() + etaMin * 60000).toISOString(),
          trustedContactIds: selectedContactIds,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ? JSON.stringify(body.error) : "Couldn't start the trip.");
        return;
      }
      const trip = await res.json();
      onCreated(trip);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-panel p-6">
      <h3 className="mb-4 text-base font-medium text-[#E7ECF5]">Start a trip</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Vehicle type">
          <select className={inputCls} value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
            {["Car", "Taxi", "Bus", "Motorcycle", "Ride-share"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Plate number">
          <input className={inputCls} value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} />
        </Field>
        <Field label="Make">
          <input className={inputCls} value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} />
        </Field>
        <Field label="Model">
          <input className={inputCls} value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} />
        </Field>
        <Field label="Color">
          <input className={inputCls} value={vehicleColor} onChange={(e) => setVehicleColor(e.target.value)} />
        </Field>
        <Field label="Expected time to arrival (minutes)">
          <input
            type="number"
            min={1}
            className={inputCls}
            value={etaMin}
            onChange={(e) => setEtaMin(Number(e.target.value) || 1)}
          />
        </Field>
        <Field label="Starting location">
          <input className={inputCls} value={fromLocation} onChange={(e) => setFromLocation(e.target.value)} />
        </Field>
        <Field label="Destination">
          <input className={inputCls} value={toLocation} onChange={(e) => setToLocation(e.target.value)} />
        </Field>
      </div>

      <div className="mt-4">
        <span className="mb-1 block text-xs font-medium text-[#8FA0BF]">Trusted contacts</span>
        <div className="flex flex-wrap gap-2">
          {contacts.length === 0 && (
            <span className="text-xs text-[#546080]">
              No trusted contacts yet — add some from the dashboard later.
            </span>
          )}
          {contacts.map((c) => (
            <button
              key={c.id}
              onClick={() => toggleContact(c.id)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                selectedContactIds.includes(c.id)
                  ? "border-blue-500 bg-[#132242] text-[#9DC0F8]"
                  : "border-[#2B3752] bg-transparent text-[#8FA0BF]"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-[#F09595]">{error}</p>}

      <button
        onClick={submit}
        disabled={submitting}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-60"
      >
        {submitting ? "Starting…" : "Start trip"}
      </button>
    </div>
  );
}
