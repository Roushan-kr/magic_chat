// this route handel Topics in user model

import dbConnect from "@/lib/dbconnect";
import { getServerSession, User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../auth/[...nextauth]/options";
import userModel from "@/models/User";

export async function GET(req: NextRequest, {params}:{params:Promise<{topic:string}>}) {
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
  const tName = (await params).topic;

  try {
    const user = await userModel.findById(_id);
    if (!user) {
      return NextResponse.json(
        {
          message: "unable to get user",
        },
        { status: 404 }
      );
    }
    const topics = user.topics;
    if (tName) {
      const userTopic = topics?.map((t) => t.name);
      return NextResponse.json(
        {
          message: "fetch user topics list",
          success: true,
          userTopic,
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        message: "fetch user topics",
        success: true,
        topics,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest,{ params }: { params: Promise<{ topic: string }> }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  const _id = user?._id;


  try {
    const user = await userModel.findById(_id);
    if (!user) {
      return NextResponse.json(
        {
          message: "unable to get user",
        },
        { status: 404 }
      );
    }
    const topics = user.topics;
    const tName = (await params).topic
    if (tName) {
      const userTopic = topics?.map((t) => t.name);
      return NextResponse.json(
        {
          message: "fetch user topics list",
          success: true,
          userTopic,
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        message: "fetch user topics",
        success: true,
        topics,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
