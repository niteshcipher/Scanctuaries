// app/api/diaries/manage/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

async function getUserIdFromCookie(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };
    return decoded.userId;
  } catch { return null; }
}

// OWNER HUB: Fetch all incoming pending knocks or current members
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const diaryId = searchParams.get("diaryId");

    if (!diaryId) return NextResponse.json({ error: "Diary ID required" }, { status: 400 });

    const diary = await prisma.diary.findFirst({
      where: {
        id: diaryId,
        creatorId: userId,
      },
      include: {
        joinRequests: { where: { status: "PENDING" }, include: { user: { select: { id: true, name: true, email: true } } } },
        users: { select: { id: true, name: true, email: true } }
      }
    });

    if (!diary) return NextResponse.json({ error: "Access denied." }, { status: 403 });

    return NextResponse.json({ requests: diary.joinRequests, members: diary.users.filter(u => u.id !== userId) });
  } catch (err) {
    return NextResponse.json({ error: "Server error handling management data" }, { status: 500 });
  }
}

// ACTION HANDLE: Accept / Kick Partner Access
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { diaryId, targetUserId, action } = await request.json(); // action: "ACCEPT", "REJECT", "KICK"

    const diary = await prisma.diary.findFirst({
      where: {
        id: diaryId,
        creatorId: userId,
      }
    });
    if (!diary) return NextResponse.json({ error: "You do not have access to manage this diary." }, { status: 403 });

    if (action === "ACCEPT") {
      await prisma.$transaction([
        prisma.joinRequest.update({
          where: { diaryId_userId: { diaryId, userId: targetUserId } },
          data: { status: "ACCEPTED" }
        }),
        prisma.diary.update({
          where: { id: diaryId },
          data: { users: { connect: { id: targetUserId } } }
        })
      ]);
      return NextResponse.json({ message: "Partner granted entrance successfully!" });
    }

    if (action === "REJECT") {
      await prisma.joinRequest.delete({
        where: { diaryId_userId: { diaryId, userId: targetUserId } }
      });
      return NextResponse.json({ message: "Join request removed successfully." });
    }

    if (action === "KICK") {
      await prisma.$transaction([
        prisma.diary.update({
          where: { id: diaryId },
          data: { users: { disconnect: { id: targetUserId } } }
        }),
        prisma.joinRequest.delete({
          where: { diaryId_userId: { diaryId, userId: targetUserId } }
        })
      ]);
      return NextResponse.json({ message: "Access keys revoked smoothly." });
    }

    return NextResponse.json({ error: "Invalid action type." }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Failed completing permission modification." }, { status: 500 });
  }
}