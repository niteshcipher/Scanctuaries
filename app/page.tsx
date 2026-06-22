// app/page.tsx
import { auth } from "@/auth"; // 🔑 Import your core Auth.js instance
import { redirect } from "next/navigation";
import LandingAuth from "./LandingAuth";

export default async function Page() {
  // 🛡️ Read the authenticated server session natively
  const session = await auth();

  // If a valid session profile is active, fast-forward straight past the landing page
  if (session) {
    redirect("/dashboard");
  }

  // Otherwise, render the custom entry gate layout
  return <LandingAuth />;
}