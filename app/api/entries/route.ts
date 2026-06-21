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

// 1. SAVE A NEW DIARY ENTRY
export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { diaryId, title, content, imageUrl, isCapsule, unlockDate } = await request.json();

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

    // Save the entry matching our extended schema
    const newEntry = await prisma.entry.create({
      data: {
        diaryId,
        authorId: userId,
        title,
        content,
        imageUrl: imageUrl || null, // Saves image reference string
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

// 2. FETCH ALL ENTRIES FOR A DIARY
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

    const entries = await prisma.entry.findMany({
      where: { diaryId },
      include: {
        author: { select: { id: true, name: true } },
        reactions: { include: { user: { select: { name: true } } } }
      },
      orderBy: { createdAt: "desc" }
    });

    const now = new Date();

    // Mask locked capsule contents at the server layer
    const processedEntries = entries.map(entry => {
      if (entry.isCapsule && entry.unlockDate && entry.unlockDate > now) {
        return {
          ...entry,
          content: "🔒 This memory is sealed inside a capsule until a future date.",
          imageUrl: null, // Clear out the attached snapshot reference if locked
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

// 3. UPDATE AN EXISTING ENTRY (PUT)
export async function PUT(request: Request) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { entryId, title, content, imageUrl } = await request.json();

    if (!entryId || !title || !content) {
      return NextResponse.json({ error: "Missing required fields for update." }, { status: 400 });
    }

    const existingEntry = await prisma.entry.findUnique({ where: { id: entryId } });
    if (!existingEntry) {
      return NextResponse.json({ error: "Memory page not found." }, { status: 404 });
    }

    // Guardrail: Verify ownership before mutating history files
    if (existingEntry.authorId !== userId) {
      return NextResponse.json({ error: "Forbidden. You can only edit your own memories." }, { status: 403 });
    }

    const updatedEntry = await prisma.entry.update({
      where: { id: entryId },
      data: { title, content, imageUrl: imageUrl || null }
    });

    return NextResponse.json({ message: "Memory polished beautifully.", entry: updatedEntry }, { status: 200 });
  } catch (error) {
    console.error("Update entry error:", error);
    return NextResponse.json({ error: "Server error editing memory page." }, { status: 500 });
  }
}

// 4. ERASE/DELETE AN ENTRY (DELETE)
export async function DELETE(request: Request) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { entryId } = await request.json();

    if (!entryId) {
      return NextResponse.json({ error: "Missing entry parameter index." }, { status: 400 });
    }

    const existingEntry = await prisma.entry.findUnique({ where: { id: entryId } });
    if (!existingEntry) {
      return NextResponse.json({ error: "Memory page location not found." }, { status: 404 });
    }

    // Guardrail: Verify ownership before deleting memory page permanently
    if (existingEntry.authorId !== userId) {
      return NextResponse.json({ error: "Forbidden. You can only erase your own pages." }, { status: 403 });
    }

    await prisma.entry.delete({ where: { id: entryId } });

    return NextResponse.json({ message: "Page successfully torn out and burned from ledger." }, { status: 200 });
  } catch (error) {
    console.error("Delete entry error:", error);
    return NextResponse.json({ error: "Server error tearing out memory page." }, { status: 500 });
  }
}