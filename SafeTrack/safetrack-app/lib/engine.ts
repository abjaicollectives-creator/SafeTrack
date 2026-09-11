import { prisma } from "./prisma";
import { GRACE_PERIOD_MS, CONFIRM_WINDOW_MS } from "./config";

// The safety engine has two jobs, both described in the PRD's overdue
// and escalation flows:
//
// 1. Any ACTIVE trip whose expected arrival + grace period has passed,
//    and that doesn't already have an alert, becomes OVERDUE and gets a
//    PENDING_CONFIRM alert asking "are you okay?".
// 2. Any PENDING_CONFIRM alert (from step 1, or from a device event)
//    that has been waiting longer than the confirm window auto-escalates
//    to an ACTIVE / HIGH severity alert, and its trip becomes EMERGENCY.
//
// There's no background worker in this hackathon build, so `runSafetyEngine`
// is called at the top of the read endpoints the UI already polls
// (GET /api/trips, GET /api/alerts). That's enough to make the demo feel
// live without standing up a cron job or queue.
export async function runSafetyEngine() {
  const now = new Date();

  const overdueTrips = await prisma.trip.findMany({
    where: {
      status: "ACTIVE",
      expectedArrival: { lt: new Date(now.getTime() - GRACE_PERIOD_MS) },
    },
    include: { alerts: true },
  });

  for (const trip of overdueTrips) {
    if (trip.alerts.some((a) => a.type === "OVERDUE")) continue;
    await prisma.$transaction([
      prisma.trip.update({
        where: { id: trip.id },
        data: { status: "OVERDUE" },
      }),
      prisma.alert.create({
        data: {
          tripId: trip.id,
          type: "OVERDUE",
          event: "Trip overdue",
          status: "PENDING_CONFIRM",
          severity: "MEDIUM",
        },
      }),
    ]);
  }

  const staleConfirmations = await prisma.alert.findMany({
    where: {
      status: "PENDING_CONFIRM",
      createdAt: { lt: new Date(now.getTime() - CONFIRM_WINDOW_MS) },
    },
  });

  for (const alert of staleConfirmations) {
    await prisma.$transaction([
      prisma.alert.update({
        where: { id: alert.id },
        data: { status: "ACTIVE", severity: "HIGH", escalatedAt: now },
      }),
      prisma.trip.update({
        where: { id: alert.tripId },
        data: { status: "EMERGENCY" },
      }),
    ]);
  }
}
