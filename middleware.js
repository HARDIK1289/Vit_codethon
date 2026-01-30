import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Run on all routes except static files and APIs
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};