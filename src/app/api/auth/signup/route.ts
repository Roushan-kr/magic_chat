import { sendVerifyMail } from "@/helpers/sendEmailVerifcation";
import dbConnect from "@/lib/dbconnect";
import userModel from "@/models/User";
import { signUpSchema } from "@/schemas/signUpSchema";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, email, password } = signUpSchema.parse(await req.json() || {});

    // Check if verified user with the same username exists
    if (await userModel.exists({ uname: username, verified: true })) {
      return NextResponse.json(
        { success: false, message: "User with this username already exists" },
        { status: 400 }
      );
    }

    // Check if user exists with the same email
    const isUserExistsWithEmail = await userModel.findOne({ email });

    if (isUserExistsWithEmail) {
      if (isUserExistsWithEmail.verified) {
        return NextResponse.json(
          { success: false, message: "User with this email already exists" },
          { status: 400 }
        );
      }

      // User exists but is not verified → Resend verification code
      isUserExistsWithEmail.verifyCode = generateVerificationCode();
      isUserExistsWithEmail.verifyExpires = new Date(Date.now() + 600000);
      await isUserExistsWithEmail.save();

      const { success, message, error } = await sendVerifyMail({
        username: isUserExistsWithEmail.uname,
        email,
        verifyCode: isUserExistsWithEmail.verifyCode,
      });

      return NextResponse.json({ success, message, error }, { status: 201 });
    }

    // If no user exists, create a new one
    const hashPassword = await bcrypt.hash(password, 10);
    const verifyCode = generateVerificationCode();

    // const newUser = 
    await userModel.create({
      uname: username,
      email,
      password: hashPassword,
      verifyCode,
      verifyExpires: new Date(Date.now() + 600000),
    });

    // Send verification email
    const { success, message, error } = await sendVerifyMail({
      username,
      email,
      verifyCode,
    });

    if (!success) {
      return NextResponse.json(
        { success: false, message, error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "User created successfully. Please verify your email." },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Error signing up user", error },
      { status: 500 }
    );
  }
}

// Helper function to generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
