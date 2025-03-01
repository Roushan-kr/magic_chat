import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/options";

export async function middleware() {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user) {
        return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
    }

    // Store user info in a secure HTTP-only cookie
    const response = NextResponse.next();
    response.cookies.set("userEmail", user.email, { httpOnly: true, secure: true, sameSite: "strict" });

    return response;
}

// Apply middleware to API routes
export const config = {
    matcher: "/api/msg/:path*",
};
