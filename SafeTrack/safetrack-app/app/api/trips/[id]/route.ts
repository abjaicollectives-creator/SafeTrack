import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runSafetyEngine } from "@/lib/engine";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await runSafetyEngine();

  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: {
      alerts: { orderBy: { createdAt: "desc" } },
      contacts: { include: { trustedContact: true } },
      deviceEvents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
  return NextResponse.json(trip);
}
