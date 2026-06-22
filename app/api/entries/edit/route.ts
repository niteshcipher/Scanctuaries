// app/api/entries/edit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth"; // 🔑 Import Auth.js session handling engine natively

export const runtime = "nodejs";

// ✅ REPLACED: Hand off session validation cleanly to Auth.js instance
async function getUserIdFromSession() {
  const session = await auth();
  return session?.user?.id || null;
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
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
    console.error("Edit entry error:", err);
    return NextResponse.json({ error: "Failed revising entry ledger." }, { status: 500 });
  }
}