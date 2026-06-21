import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LandingAuth from "./LandingAuth";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  // If a valid session token exists, bypass the authentication screen completely
  if (token) {
    redirect("/dashboard");
  }

  // Otherwise, serve the custom authentication entry design
  return <LandingAuth />;
}