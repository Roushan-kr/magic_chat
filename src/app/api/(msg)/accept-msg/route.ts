import userModel from "@/models/User";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession, User } from "next-auth";
import dbConnect from "@/lib/dbconnect";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  if (!session || !user) {
    NextResponse.json(
      {
        message: "You are not authenticated",
        success: false,
      },
      { status: 401 }
    );
  }

  const _id = user?._id;

  const { acceptMsg } = await req.json();

  if (acceptMsg === undefined) {
    return NextResponse.json(
      {
        message: "Please provide acceptMsg",
        success: false,
      },
      { status: 400 }
    );
  }
  try {
    const data = await userModel.findByIdAndUpdate(
      _id,
      { isAcceptingMessage: acceptMsg },
      { new: true }
    );

    if (data) {
      return NextResponse.json(
        {
          message: "user acceptMsg updated successfully",
          success: true,
          data,
        },
        { status: 200 }
      );
    }
    throw new Error("faild to update user acceptMsg");
  } catch (error) {
    return NextResponse.json(
      {
        message: "faild to update user acceptMsg",
        success: false,
        error,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  if (!session || !user) {
    NextResponse.json(
      {
        message: "You are not authenticated",
        success: false,
      },
      { status: 401 }
    );
  }

  const _id = user?._id;

  try {
    const user = await userModel.findById(_id);
    if (!user) {
      return NextResponse.json(
        {
          message: "unable to get user",
          success: false,
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: true,
        isAcceptingMessage: user?.isAcceptingMessage,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message || "Someting went worng",
        success: false,
      },
      { status: 500 }
    );
  }
}
