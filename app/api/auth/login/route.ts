// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { signIn } from "@/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Hand execution over to Auth.js Credentials system
    await signIn("credentials", {
      email,
      password,
      redirect: false, // Prevents server-side redirects so your frontend can handle it
    });

    return NextResponse.json({
      message: "Welcome back!",
    }, { status: 200 });

  } catch (error: any) {
    // Auth.js throws a specific error on failure
    if (error.type === "CredentialsSignin") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    console.error("LOGIN API ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong during login." },
      { status: 500 }
    );
  }
}