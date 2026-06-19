// app/api/diaries/delete/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

async function getUserIdFromCookie(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = cookieHeader.split("; ").find(row => row.startsWith("token="))?.split("=")[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };
    return decoded.userId;
  } catch { return null; }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { diaryId } = await request.json();
    if (!diaryId) return NextResponse.json({ error: "Diary ID required" }, { status: 400 });

    // Ensure only the absolute creatorId can delete the resource container
    const diary = await prisma.diary.findFirst({
      where: { id: diaryId, creatorId: userId }
    });

    if (!diary) {
      return NextResponse.json({ error: "Only the creator can destroy this sanctuary." }, { status: 403 });
    }

    await prisma.diary.delete({ where: { id: diaryId } });

    return NextResponse.json({ message: "Sanctuary completely deleted." });
  } catch (err) {
    return NextResponse.json({ error: "Failed to erase diary container." }, { status: 500 });
  }
}