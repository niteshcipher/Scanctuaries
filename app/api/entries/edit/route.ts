// app/api/entries/edit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

async function getUserIdFromCookie(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };
    return decoded.userId;
  } catch { return null; }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { entryId, title, content } = await request.json();
    if (!entryId || !title || !content) {
      return NextResponse.json({ error: "Missing required update fields." }, { status: 400 });
    }

    // Security Guard: Ensure only the original author can overwrite the ink record
    const existingEntry = await prisma.entry.findUnique({ where: { id: entryId } });
    if (!existingEntry) return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    if (existingEntry.authorId !== userId) {
      return NextResponse.json({ error: "You can only edit memories inscribed by yourself." }, { status: 403 });
    }

    const updated = await prisma.entry.update({
      where: { id: entryId },
      data: { title, content }
    });

    return NextResponse.json({ message: "Memory rewrote smoothly.", entry: updated });
  } catch (err) {
    return NextResponse.json({ error: "Failed revising entry ledger." }, { status: 500 });
  }
}