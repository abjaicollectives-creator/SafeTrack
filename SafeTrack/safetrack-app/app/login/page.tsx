"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";

const inputCls =
  "w-full rounded-lg border border-[#2B3752] bg-[#0F1729] px-3 py-2 text-sm text-[#E7ECF5] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("david@safetrack.demo");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  async function submit() {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't sign in.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-10">
      <AppHeader />
      <div className="rounded-2xl border border-border bg-panel p-6">
        <h2 className="mb-4 text-base font-medium text-[#E7ECF5]">Sign in</h2>
        <div className="space-y-3">
          <input className={inputCls} placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            type="password"
            className={inputCls}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="mt-3 text-sm text-[#F09595]">{error}</p>}
        <button
          onClick={submit}
          className="mt-5 w-full rounded-lg bg-blue-500 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600"
        >
          Sign in
        </button>
        <p className="mt-4 text-center text-xs text-[#8FA0BF]">
          Demo account is pre-filled &mdash; just hit sign in.
        </p>
      </div>
    </main>
  );
}
