import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  action: z.enum(["CONFIRM_SAFE", "ESCALATE", "RESOLVE"]),
});

// PATCH /api/alerts/:id
// - CONFIRM_SAFE: traveler taps "I'm safe" -> alert RESOLVED, trip back to ACTIVE.
// - ESCALATE: traveler taps "Send SOS" from the confirm modal, or the
//   confirm window times out client-side -> alert ACTIVE/HIGH, trip EMERGENCY.
// - RESOLVE: security operator resolves an active alert -> trip back to ACTIVE
//   (or stays COMPLETED if the traveler already checked out).
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const alert = await prisma.alert.findUnique({ where: { id: params.id } });
  if (!alert) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  const { action } = parsed.data;

  if (action === "CONFIRM_SAFE") {
    const updated = await prisma.alert.update({
      where: { id: alert.id },
      data: { status: "RESOLVED", resolvedAt: new Date() },
    });
    await prisma.trip.updateMany({
      where: { id: alert.tripId, status: { not: "COMPLETED" } },
      data: { status: "ACTIVE" },
    });
    return NextResponse.json(updated);
  }

  if (action === "ESCALATE") {
    const updated = await prisma.alert.update({
      where: { id: alert.id },
      data: { status: "ACTIVE", severity: "HIGH", escalatedAt: new Date() },
    });
    await prisma.trip.update({
      where: { id: alert.tripId },
      data: { status: "EMERGENCY" },
    });
    return NextResponse.json(updated);
  }

  // RESOLVE
  const updated = await prisma.alert.update({
    where: { id: alert.id },
    data: { status: "RESOLVED", resolvedAt: new Date() },
  });
  await prisma.trip.updateMany({
    where: { id: alert.tripId, status: { not: "COMPLETED" } },
    data: { status: "ACTIVE" },
  });
  return NextResponse.json(updated);
}
