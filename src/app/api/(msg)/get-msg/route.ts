import userModel from "@/models/User";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession, User } from "next-auth";
import dbConnect from "@/lib/dbconnect";
import {  NextResponse } from "next/server";
import mongoose from "mongoose";

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
        $match: {_id},
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
