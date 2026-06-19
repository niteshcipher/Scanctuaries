// app/api/diaries/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

// Helper function to extract user ID from the secure HttpOnly cookie
async function getUserIdFromCookie(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

// ✅ FIXED: Changed parameter type from Request to NextRequest
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const connectedDiaries = await prisma.diary.findMany({
      where: { users: { some: { id: userId } } },
      orderBy: { createdAt: "desc" }
    });

    // Pull requests sent by the current user along with target diary details
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

// 1. CREATE A NEW DIARY (Generates an Invite Code & assigns Admin Creator)
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please login first." }, { status: 401 });
    }

    const { title } = await request.json();
    if (!title) {
      return NextResponse.json({ error: "Please give your diary a title" }, { status: 400 });
    }

    // Generate a beautiful unique 6-character partner invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Save diary and immediately connect the creator as a member
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

// 2. REQUEST TO JOIN A DIARY (Creates a PENDING Handshake Knock)
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromCookie(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please login first." }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Please provide an invitation code" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Find the diary matching that specific invite code
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

    // Prevent duplicate joins or self-requests
    if (targetDiary.users.some((member) => member.id === userId)) {
      return NextResponse.json({ error: "You are already part of this diary." }, { status: 400 });
    }

    // Exclusivity Guard: Block knocks if the diary is already populated by a partner
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

    // 🕊️ Create the secure pending request entry (The "Knock" Handshake)
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