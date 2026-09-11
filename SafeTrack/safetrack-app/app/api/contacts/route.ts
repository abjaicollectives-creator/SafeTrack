import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserOrDemo } from "@/lib/auth";

const contactSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  relation: z.string().optional(),
});

export async function GET() {
  const user = await getCurrentUserOrDemo();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const contacts = await prisma.trustedContact.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUserOrDemo();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const contact = await prisma.trustedContact.create({
    data: { ...parsed.data, userId: user.id },
  });
  return NextResponse.json(contact, { status: 201 });
}
