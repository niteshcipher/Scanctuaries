// app/api/entries/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

// Helper function to extract user ID from the secure HttpOnly cookie
async function getUserIdFromCookie(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = cookieHeader
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

// 1. SAVE A NEW DIARY ENTRY (With optional Memory Capsule Lock)
export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { diaryId, title, content, isCapsule, unlockDate } = await request.json();

    if (!diaryId || !title || !content) {
      return NextResponse.json({ error: "Missing required entry fields." }, { status: 400 });
    }

    // Security Check: Verify user belongs to this diary
    const diaryAccess = await prisma.diary.findFirst({
      where: {
        id: diaryId,
        users: { some: { id: userId } }
      }
    });

    if (!diaryAccess) {
      return NextResponse.json({ error: "Access Denied. You do not belong to this diary." }, { status: 403 });
    }

    // Save the entry matching our schema
    const newEntry = await prisma.entry.create({
      data: {
        diaryId,
        authorId: userId,
        title,
        content,
        isCapsule: isCapsule || false,
        unlockDate: isCapsule && unlockDate ? new Date(unlockDate) : null,
      }
    });

    return NextResponse.json({ message: "Memory written beautifully.", entry: newEntry }, { status: 201 });
  } catch (error) {
    console.error("Entry creation error:", error);
    return NextResponse.json({ error: "Server error creating entry." }, { status: 500 });
  }
}

// 2. FETCH ALL ENTRIES FOR A DIARY (Enforces Memory Capsule Time-Locking)
export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const diaryId = searchParams.get("diaryId");

    if (!diaryId) {
      return NextResponse.json({ error: "Diary ID parameter required" }, { status: 400 });
    }

    // Security Check: Verify requesting user is linked to the diary instance
    const diaryAccess = await prisma.diary.findFirst({
      where: {
        id: diaryId,
        users: { some: { id: userId } }
      }
    });

    if (!diaryAccess) {
      return NextResponse.json({ error: "Access Denied." }, { status: 403 });
    }

    // Pull all journal entries, including their authors and reactions
    const entries = await prisma.entry.findMany({
      where: { diaryId },
      include: {
        author: { select: { id: true, name: true } },
        reactions: { include: { user: { select: { name: true } } } }
      },
      orderBy: { createdAt: "desc" }
    });

    const now = new Date();

    // 🔒 THE PROFESSIONAL STEP: Mask locked capsule contents at the server layer
    const processedEntries = entries.map(entry => {
      if (entry.isCapsule && entry.unlockDate && entry.unlockDate > now) {
        return {
          ...entry,
          content: "🔒 This memory is sealed inside a capsule until a future date.", // Hide the actual content securely
          isLocked: true
        };
      }
      return { ...entry, isLocked: false };
    });

    return NextResponse.json({ entries: processedEntries }, { status: 200 });
  } catch (error) {
    console.error("Fetch entries error:", error);
    return NextResponse.json({ error: "Server error fetching entries." }, { status: 500 });
  }
}