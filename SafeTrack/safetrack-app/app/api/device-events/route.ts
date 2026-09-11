import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const eventSchema = z.object({
  tripId: z.string().min(1),
  deviceType: z.enum(["smartwatch", "iot", "phone", "wearable"]),
  eventType: z.enum(["FALL", "ABNORMAL_HEART_RATE", "NO_MOVEMENT", "SOS"]),
  heartRate: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const EVENT_LABEL: Record<string, string> = {
  FALL: "Fall detected",
  ABNORMAL_HEART_RATE: "Abnormal heart-rate reading",
  NO_MOVEMENT: "No movement detected",
  SOS: "Manual SOS from device",
};

// POST /api/device-events - the simulated IoT / smartwatch endpoint.
// Receives an event, stores it, and creates a PENDING_CONFIRM alert that
// asks the traveler "are you okay?" (mirrors the trip-overdue flow).
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { tripId, deviceType, eventType, heartRate, latitude, longitude } =
    parsed.data;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const [deviceEvent, alert] = await prisma.$transaction([
    prisma.deviceEvent.create({
      data: { tripId, deviceType, eventType, heartRate, latitude, longitude },
    }),
    prisma.alert.create({
      data: {
        tripId,
        type: "DEVICE",
        event: EVENT_LABEL[eventType] ?? eventType,
        heartRate,
        status: "PENDING_CONFIRM",
        severity: "MEDIUM",
      },
    }),
  ]);

  if (latitude != null && longitude != null) {
    await prisma.trip.update({
      where: { id: tripId },
      data: { lastLatitude: latitude, lastLongitude: longitude },
    });
  }

  return NextResponse.json({ deviceEvent, alert }, { status: 201 });
}
