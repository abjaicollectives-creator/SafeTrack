import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { runSafetyEngine } from "@/lib/engine";

const alertSchema = z.object({
  tripId: z.string().min(1),
  type: z.enum(["OVERDUE", "DEVICE", "SOS"]),
  event: z.string().min(1),
  heartRate: z.number().optional(),
});

// GET /api/alerts - security dashboard feed. Runs the engine first so
// overdue trips and stale confirmations have already turned into alerts.
export async function GET(req: NextRequest) {
  await runSafetyEngine();

  const statusFilter = req.nextUrl.searchParams.get("status");

  const alerts = await prisma.alert.findMany({
    where: statusFilter ? { status: statusFilter as any } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      trip: { include: { user: true } },
    },
  });

  return NextResponse.json(alerts);
}

// POST /api/alerts - manual alert creation.
// Used directly by the SOS button: type = SOS, severity = HIGH,
// status = ACTIVE (no "are you okay" confirmation step for a manual SOS).
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = alertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { tripId, type, event, heartRate } = parsed.data;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const isManualSos = type === "SOS";

  const alert = await prisma.alert.create({
    data: {
      tripId,
      type,
      event,
      heartRate,
      status: isManualSos ? "ACTIVE" : "PENDING_CONFIRM",
      severity: isManualSos ? "HIGH" : "MEDIUM",
      escalatedAt: isManualSos ? new Date() : null,
    },
  });

  await prisma.trip.update({
    where: { id: tripId },
    data: { status: isManualSos ? "EMERGENCY" : "OVERDUE" },
  });

  return NextResponse.json(alert, { status: 201 });
}
