import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth"; // <-- Import the auth framework from your root auth.ts

export const runtime = "nodejs";

// ✅ REPLACED: Use Auth.js natively instead of custom jwt.verify
async function getUserIdFromSession() {
  const session = await auth();
  return session?.user?.id || null;
}

// 1. GET ALL DIARIES & REQUESTS
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const connectedDiaries = await prisma.diary.findMany({
      where: { users: { some: { id: userId } } },
      orderBy: { createdAt: "desc" }
    });

    const userSentRequests = await prisma.joinRequest.findMany({
      where: { userId: userId },
      include: {
        diary: { select: { title: true, inviteCode: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const incomingRequests = await prisma.joinRequest.findMany({
      where: {
        diary: { creatorId: userId },
        status: "PENDING"
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        diary: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ 
      diaries: connectedDiaries,
      sentRequests: userSentRequests,
      incomingRequests: incomingRequests,
      currentUserId: userId
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed fetching active notebook spaces." }, { status: 500 });
  }
}

// 2. CREATE A NEW DIARY
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please login first." }, { status: 401 });
    }

    const { title } = await request.json();
    if (!title) {
      return NextResponse.json({ error: "Please give your diary a title" }, { status: 400 });
    }

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newDiary = await prisma.diary.create({
      data: {
        title,
        inviteCode,
        creatorId: userId,
        users: {
          connect: { id: userId },
        },
      },
    });

    return NextResponse.json({
      message: "Diary sanctuary created successfully!",
      diary: newDiary,
    }, { status: 201 });
  } catch (error) {
    console.error("Diary creation error:", error);
    return NextResponse.json({ error: "Could not create diary container." }, { status: 500 });
  }
}

// 3. REQUEST TO JOIN A DIARY (PUT)
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please login first." }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Please provide an invitation code" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const targetDiary = await prisma.diary.findUnique({
      where: { inviteCode: cleanCode },
      select: {
        id: true,
        title: true,
        inviteCode: true,
        creatorId: true,
        createdAt: true,
        nudgeDays: true,
        users: { select: { id: true } },
      },
    });

    if (!targetDiary) {
      return NextResponse.json({ error: "Invalid invitation code. Please check again." }, { status: 404 });
    }

    if (targetDiary.users.some((member) => member.id === userId)) {
      return NextResponse.json({ error: "You are already part of this diary." }, { status: 400 });
    }

    const hasPartner = targetDiary.users.some(member => member.id !== targetDiary.creatorId);
    if (hasPartner) {
      return NextResponse.json({ error: "This private diary room is already occupied by an active partner." }, { status: 400 });
    }

    const existingRequest = await prisma.joinRequest.findUnique({
      where: {
        diaryId_userId: {
          diaryId: targetDiary.id,
          userId,
        },
      },
    });

    if (existingRequest) {
      return NextResponse.json({ error: "You have already sent an entrance request to this space." }, { status: 400 });
    }

    await prisma.joinRequest.create({
      data: {
        diaryId: targetDiary.id,
        userId,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      message: "Knock sent successfully! Awaiting owner authorization approval.",
    }, { status: 200 });

  } catch (error: any) {
    console.error("Join request error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "You have already sent an entrance request to this space." }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not file connection request request." }, { status: 500 });
  }
}