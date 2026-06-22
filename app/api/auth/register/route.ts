// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

// 📧 Standard RFC 5322 Regex to validate real email formats
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 });
    }

    // Normalize email to match checks correctly
    const cleanEmail = email.toLowerCase().trim();

    // 🔬 NEW: Structural validation guardrail check
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json({ error: "Provided string is not a valid email address." }, { status: 400 });
    }

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { accounts: true } // Fetches connected OAuth providers if any exist
    });

    if (existingUser) {
      // Check if they originally registered via Google OAuth
      const hasGoogleAccount = existingUser.accounts.some(acc => acc.provider === "google");
      if (hasGoogleAccount) {
        return NextResponse.json({ 
          error: "This email is already linked to a Google account. Please log in using Google instead." 
        }, { status: 400 });
      }

      // ✅ UPDATED: Clear notification phrase so the frontend can display a clean "Go to login" call to action
      return NextResponse.json({ 
        error: "This email is already registered. Please log in here." 
      }, { status: 400 });
    }

    // 2. Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Save new user to your database (via Prisma)
    const newUser = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true }, // Safeguard password hash from leaking
    });

    return NextResponse.json({ 
      message: "Account created beautifully!", 
      user: newUser 
    }, { status: 201 });

  } catch (error: any) {
    console.error("FULL SIGNUP ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || String(error),
        full: JSON.stringify(error, null, 2)
      },
      { status: 500 }
    );
  }
}