import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/trips/:id/checkout
// Update: status = CHECKED_OUT (COMPLETED), checked_out_at = now.
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const trip = await prisma.trip.findUnique({ where: { id: params.id } });
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
  if (trip.status === "COMPLETED") {
    return NextResponse.json(trip);
  }

  const updated = await prisma.trip.update({
    where: { id: params.id },
    data: { status: "COMPLETED", checkedOutAt: new Date() },
  });

  // Checking out safely resolves any alert still open on this trip.
  await prisma.alert.updateMany({
    where: { tripId: params.id, status: { not: "RESOLVED" } },
    data: { status: "RESOLVED", resolvedAt: new Date() },
  });

  return NextResponse.json(updated);
}
