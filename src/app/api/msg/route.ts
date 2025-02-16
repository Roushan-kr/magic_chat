import userModel, { Message } from "@/models/User";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession, User } from "next-auth";
import dbConnect from "@/lib/dbconnect";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { msgSchema } from "@/schemas/messageSchema";

export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  if (!session || !user) {
    return NextResponse.json(
      {
        message: "You are not authenticated",
        success: false,
      },
      { status: 401 }
    );
  }

  const _id = new mongoose.Types.ObjectId(user?._id);

  try {
    const userMsg = await userModel.aggregate([
      {
        $match: { _id },
      },
      {
        $unwind: "$messages",
      },
      {
        $sort: { "messages.createdAt": -1 },
      },
      {
        $group: {
          _id: "$_id",
          messages: {
            $push: "$messages",
          },
        },
      },
    ]);

    if (!userMsg || userMsg.length === 0) {
      return NextResponse.json(
        {
          message: "User Doesnot have any message ",
          success: false,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "fetch success",
        success: true,
        messages: userMsg[0]?.messages,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "something went wrong";
    return NextResponse.json(
      {
        message: errorMessage,
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();

  const { username, content } = await req.json();
  try {
    const msg = msgSchema.safeParse({ content });
    // handle the parsed message

    if (!msg.success) {
      return NextResponse.json(
        {
          message: "unable to parse content",
          success: false,
        },
        { status: 401 }
      );
    }
    const user = await userModel.findOne({ uname: username });
    if (!user) {
      return NextResponse.json(
        {
          message: "unable to get user by username",
          success: false,
        },
        { status: 404 }
      );
    }
    if (!user.isAcceptingMessage) {
      return NextResponse.json(
        {
          message: "user not accepting msg",
          success: true,
        },
        { status: 403 }
      );
    }

    user.messages.push({
      content: msg.data.content,
      createdAt: new Date(),
    } as Message);

    await user.save();
    return NextResponse.json(
      {
        message: "msg sent success",
        success: true,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "something went wrong";
    return NextResponse.json(
      {
        message: errorMessage,
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { messageid } = await req.json();
  if (!messageid) {
    return NextResponse.json(
      {
        sucess: false,
        message: "No message id found",
      },
      {
        status: 400,
      }
    );
  }

  const session = await getServerSession(authOptions);
  const _user: User = session?.user;

  if (!session || !_user) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }
  dbConnect();
  try {
    const updatedResult = await userModel.updateOne(
      { _id: _user._id },
      {
        $pull: {
          messages: {
            _id: messageid,
          },
        },
      }
    );

    if (updatedResult.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Either message is deleted or not exixt" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, message: "message deleted successfull" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "something went wrong";
    return NextResponse.json(
      {
        message: errorMessage,
        success: false,
      },
      { status: 500 }
    );
  }
}
