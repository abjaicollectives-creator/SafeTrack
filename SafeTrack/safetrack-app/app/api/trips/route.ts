import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserOrDemo } from "@/lib/auth";
import { runSafetyEngine } from "@/lib/engine";

const tripSchema = z.object({
  vehicleType: z.string().min(1),
  vehicleMake: z.string().min(1),
  vehicleModel: z.string().min(1),
  vehicleColor: z.string().min(1),
  plateNumber: z.string().min(1),
  fromLocation: z.string().min(1),
  toLocation: z.string().min(1),
  expectedArrival: z.string().datetime(),
  notes: z.string().optional(),
  trustedContactIds: z.array(z.string()).optional(),
});

// GET /api/trips - list the current user's trips, most recent first.
// Runs the safety engine first so overdue/escalation state is fresh.
export async function GET() {
  await runSafetyEngine();

  const user = await getCurrentUserOrDemo();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const trips = await prisma.trip.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { alerts: true, contacts: { include: { trustedContact: true } } },
  });

  return NextResponse.json(trips);
}

// POST /api/trips - start a new trip.
// 1. Validate the request.
// 2. Create the trip.
// 3. Set status = ACTIVE, checkedInAt = now.
// 4. Return the trip.
export async function POST(req: NextRequest) {
  const user = await getCurrentUserOrDemo();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = tripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const trip = await prisma.trip.create({
    data: {
      userId: user.id,
      vehicleType: data.vehicleType,
      vehicleMake: data.vehicleMake,
      vehicleModel: data.vehicleModel,
      vehicleColor: data.vehicleColor,
      plateNumber: data.plateNumber,
      fromLocation: data.fromLocation,
      toLocation: data.toLocation,
      notes: data.notes,
      expectedArrival: new Date(data.expectedArrival),
      status: "ACTIVE",
      checkedInAt: new Date(),
      contacts: data.trustedContactIds
        ? {
            create: data.trustedContactIds.map((id) => ({
              trustedContactId: id,
            })),
          }
        : undefined,
    },
    include: { contacts: { include: { trustedContact: true } } },
  });

  return NextResponse.json(trip, { status: 201 });
}
