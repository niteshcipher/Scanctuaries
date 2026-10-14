// app/api/diaries/delete/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth"; // 🔑 Import Auth.js session handling engine natively

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  try {
    // 🎯 Extract the authenticated user session via Auth.js securely
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please login first." }, { status: 401 });
    }

    let diaryId: string | null = null;
    try {
      const url = new URL(request.url);
      diaryId = url.searchParams.get("diaryId");
    } catch {
      // not a standard url
    }

    if (!diaryId) {
      try {
        const body = await request.json();
        diaryId = body.diaryId;
      } catch {
        // empty body
      }
    }

    if (!diaryId) {
      return NextResponse.json({ error: "Diary ID required" }, { status: 400 });
    }

    // Ensure only the creator can delete the diary
    const diary = await prisma.diary.findFirst({
      where: { id: diaryId, creatorId: userId }
    });

    if (!diary) {
      return NextResponse.json({ error: "Only the creator can destroy this sanctuary." }, { status: 403 });
    }

    const entries = await prisma.entry.findMany({
      where: { diaryId },
      select: { id: true },
    });
    const entryIds = entries.map((e) => e.id);

    await prisma.$transaction([
      prisma.reaction.deleteMany({
        where: { entryId: { in: entryIds } },
      }),
      prisma.entry.deleteMany({
        where: { diaryId },
      }),
      prisma.joinRequest.deleteMany({
        where: { diaryId },
      }),
      prisma.diary.delete({
        where: { id: diaryId },
      }),
    ]);

    return NextResponse.json({ message: "Sanctuary completely deleted." }, { status: 200 });
  } catch (err) {
    console.error("Diary volume erasure fault:", err);
    return NextResponse.json({ error: "Failed to erase diary container." }, { status: 500 });
  }
}