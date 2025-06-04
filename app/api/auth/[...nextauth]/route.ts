// app/api/auth/[...nextauth]/route.ts
// NextAuth API route handler

import { authOptions } from "@/lib/auth-config";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
