import { redirect } from "next/navigation";

/**
 * Root redirect.
 * - This is a Server Component so we can't read Zustand here.
 * - New visitors enter through the product story before authentication.
 * - To reach sign-in, visit /auth/sign-in
 */
export default function RootPage() {
  redirect("/product");
}
