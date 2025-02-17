import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbconnect";
import userModel from "@/models/User";
import { authOptions } from "../../auth/[...nextauth]/options";
import { acceptMsgSchema } from "@/schemas/acceptMessageSchema";

async function authenticateUser() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

export async function POST(req: NextRequest) {
  const user = await authenticateUser();
  if (!user) {
    return NextResponse.json({ message: "You are not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = acceptMsgSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      user._id,
      { isAcceptingMessage: parsed.data.acceptMessage },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("Failed to update user acceptMsg");
    }

    return NextResponse.json({ message: "User acceptMsg updated successfully", success: true }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET(req:NextRequest) {
  const user = await authenticateUser();
  if (!user) {
    return NextResponse.json({ message: "You are not authenticated" }, { status: 401 });
  }

  try {
    const foundUser = await userModel.findById(user._id);
    if (!foundUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ isAcceptingMessage: foundUser.allowMessages, success: true }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
