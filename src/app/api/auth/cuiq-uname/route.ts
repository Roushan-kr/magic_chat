import dbConnect from "@/lib/dbconnect";
import userModel from "@/models/User";
import { userNameValidation } from "@/schemas/signUpSchema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();

  const uname = req.nextUrl.searchParams.get("u");
  if (!uname) {
    return NextResponse.json({ message: "Username is required", success: false }, { status: 400 });
  }

  const checkUname = userNameValidation.safeParse(uname);
  if (!checkUname.success) {
    return NextResponse.json(
      { message: checkUname.error.errors?.[0]?.message || "Invalid username", success: false },
      { status: 400 }
    );
  }

  try {
    const isTaken = await userModel.exists({ uname, verified: true });
    return NextResponse.json(
      { message: isTaken ? "Username already taken" : "Username is available", success: !isTaken },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Something went wrong", success: false },
      { status: 500 }
    );
  }
}
