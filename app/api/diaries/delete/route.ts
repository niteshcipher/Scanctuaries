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

    const { diaryId } = await request.json();
    if (!diaryId) {
      return NextResponse.json({ error: "Diary ID required" }, { status: 400 });
    }

    // Ensure only the absolute creatorId can delete the resource container
    const diary = await prisma.diary.findFirst({
      where: { id: diaryId, creatorId: userId }
    });

    if (!diary) {
      return NextResponse.json({ error: "Only the creator can destroy this sanctuary." }, { status: 403 });
    }

    // Erase the entire diary container (Cascades to drop associated requests/entries cleanly)
    await prisma.diary.delete({ where: { id: diaryId } });

    return NextResponse.json({ message: "Sanctuary completely deleted." }, { status: 200 });
  } catch (err) {
    console.error("Diary volume erasure fault:", err);
    return NextResponse.json({ error: "Failed to erase diary container." }, { status: 500 });
  }
}