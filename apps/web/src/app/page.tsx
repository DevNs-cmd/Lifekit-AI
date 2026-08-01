import { redirect } from "next/navigation";

/**
 * Root redirect.
 * - This is a Server Component so we can't read Zustand here.
 * - We redirect to /home (dashboard). The dashboard layout will handle
 *   unauthenticated access once a real auth provider is wired up.
 * - To reach the marketing site directly, visit /landing or /about etc.
 * - To reach sign-in, visit /auth/sign-in
 */
export default function RootPage() {
  redirect("/home");
}
