"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";

const inputCls =
  "w-full rounded-lg border border-[#2B3752] bg-[#0F1729] px-3 py-2 text-sm text-[#E7ECF5] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error?.formErrors?.join(", ") ?? body.error ?? "Couldn't register.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-10">
      <AppHeader />
      <div className="rounded-2xl border border-border bg-panel p-6">
        <h2 className="mb-4 text-base font-medium text-[#E7ECF5]">Create an account</h2>
        <div className="space-y-3">
          <input className={inputCls} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={inputCls} placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            type="password"
            className={inputCls}
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="mt-3 text-sm text-[#F09595]">{error}</p>}
        <button
          onClick={submit}
          className="mt-5 w-full rounded-lg bg-blue-500 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600"
        >
          Create account
        </button>
      </div>
    </main>
  );
}
