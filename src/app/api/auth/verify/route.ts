import dbConnect from "@/lib/dbconnect";
import userModel from "@/models/User";
import { userNameValidation } from "@/schemas/signUpSchema";
import { verifySchema } from "@/schemas/verifySchema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = decodeURIComponent(req.nextUrl.searchParams.get("code") || "");
  const uname = decodeURIComponent(req.nextUrl.searchParams.get("uname") || "");
  // console.log(code,uname,"here");
  
  if (!code || !uname) {
    return NextResponse.json(
      { message: "Invalid request", success: false },
      { status: 400 }
    );
  }

  await dbConnect();
  try {
    // verify code and uname syntex
    const isValidCode = verifySchema.safeParse({verifyCode: code});
    const isValiduname = userNameValidation.safeParse(uname);

    if (isValidCode.success === false || isValiduname.success === false) {
      return NextResponse.json(
        { message: "Invalid data", success: false },
        { status: 401 }
      );
    }

    // check if the code is valid and related to uname
    const isUser = await userModel.findOne({ uname });
    console.log(isUser)
    if (!isUser) {
      return NextResponse.json(
        { message: "Invalid request unable to user", success: false },
        { status: 400 }
      );
    }
    const isCodeValid = isUser.verifyCode === code;
    const isCodeNotExpire = isUser.verifyExpires ? new Date(isUser.verifyExpires) > new Date() : false;
    

   if(isCodeValid && isCodeNotExpire){
    isUser.verified = true;
    await isUser.save();
    return NextResponse.json(
      { message: "Account is verified", success: true },
      { status: 200 }
    );
   }

   return NextResponse.json(
    { message: "Invalid code or code expire", success: false },
    { status: 400 }
    );

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
}
