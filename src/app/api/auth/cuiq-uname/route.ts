import dbConnect from "@/lib/dbconnect";
import userModel from "@/models/User";
import { uerNameValidation } from "@/schemas/signUpSchema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  
  await dbConnect();

  try {
    const uname = req.nextUrl.searchParams.get("uname");
    const checkUname = uerNameValidation.safeParse(uname);

    if (checkUname.success === false) {
      return NextResponse.json(
        {
          message: checkUname.error.errors[0].message || "Invalid username",
          success: false,
        },
        { status: 400 }
      );
    }

    const isUniqueAndVerifiedTaken = await userModel.findOne({
      uname,
      isVerified: true,
    });

    if (isUniqueAndVerifiedTaken) {
      return NextResponse.json(
        { message: "Username already Taken", success: false },
        { status: 200 }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "something went wrong";
    return NextResponse.json(
      {
        message: errorMessage,
        success: false,
      },
      { status: 500 }
    );
  }
  return NextResponse.json(
    { message: "Username is abhilable", success: true },
    { status: 200 }
  );
}
