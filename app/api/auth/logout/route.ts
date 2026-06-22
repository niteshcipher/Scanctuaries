// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { signOut } from "@/auth"; // <-- Import signOut from your root auth configuration

export const runtime = "nodejs";

export async function POST() {
  try {
    // 🕊️ Let Auth.js clear all official session cookies cleanly across all providers
    await signOut({ redirect: false });

    const response = NextResponse.json(
      { message: "Logged out safely. See you soon." },
      { status: 200 }
    );

    // 🧹 OPTIONAL: Keeps fallback cleanup if you still have legacy manual cookies floating around
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout API Error:", error);
    return NextResponse.json(
      { error: "Something went wrong during sign out." },
      { status: 500 }
    );
  }
}