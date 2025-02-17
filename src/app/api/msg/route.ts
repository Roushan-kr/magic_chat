import userModel from "@/models/User";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession, User } from "next-auth";
import dbConnect from "@/lib/dbconnect";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { msgSchema } from "@/schemas/messageSchema";
import MessageModel, { Message } from "@/models/Message";

async function authenticateUser() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  return session?.user || null;
}



export async function GET(req: NextRequest) {
  const user:User = await authenticateUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const skip = (page - 1) * limit;

  try {
    const messages = await MessageModel.find({ resiver: new mongoose.Types.ObjectId(user._id) })
      .sort({ createdAt: -1 }) // Sort by latest messages
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JS objects

    const totalMessages = await MessageModel.countDocuments({ resiver: user._id });

    return NextResponse.json({
      success: true,
      message: "Messages fetched successfully",
      data: {
        messages,
        page,
        limit,
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  await dbConnect();
  const { username, content } = await req.json();

  // Validate message content
  const msg = msgSchema.safeParse({ content });
  if (!msg.success) {
    return NextResponse.json(
      { success: false, message: "Invalid content" },
      { status: 400 }
    );
  }

  try {
    // Find receiver user by username
    const receiver = await userModel.findOne({uname:username});
    if (!receiver) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!receiver.allowMessages) {
      return NextResponse.json(
        { success: false, message: "User is not accepting messages" },
        { status: 403 }
      );
    }

    // Create a new message document
    const newMessage = await MessageModel.create({
      text: msg.data.content,
      createdAt: new Date(),
      resiver: receiver._id, // Store the receiver's ObjectId
    });

    // Store the message reference inside User model
    receiver.messages.push(newMessage._id);
    await receiver.save();

    return NextResponse.json(
      { success: true, message: "Message sent successfully", data: newMessage },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { messageId } = await req.json();

  if (!messageId) {
    return NextResponse.json(
      { success: false, message: "No message ID provided", data: null },
      { status: 400 }
    );
  }

  // Get authenticated user
  const user = await authenticateUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Not authenticated", data: null },
      { status: 401 }
    );
  }

  try {
    // Find the message to ensure it exists
    const message = await MessageModel.findById(messageId);
    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message not found", data: null },
        { status: 404 }
      );
    }

    // Ensure the user owns the message (receiver)
    if (message.resiver.toString() !== user._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete this message", data: null },
        { status: 403 }
      );
    }

    // Delete the message from `MessageModel`
    await MessageModel.deleteOne({ _id: messageId });

    // Remove message reference from User
    await userModel.updateOne(
      { _id: user._id },
      { $pull: { messages: messageId } }
    );

    return NextResponse.json(
      { success: true, message: "Message deleted successfully", data: { messageId } },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Something went wrong", data: null },
      { status: 500 }
    );
  }
}


export async function PUT(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "You are not authenticated", error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { messageId, newContent } = await req.json();

    // Validate inputs
    if (!messageId || !newContent) {
      return NextResponse.json(
        { success: false, message: "Missing required fields", error: "messageId and newContent are required" },
        { status: 400 }
      );
    }

    // Validate new message content
    const parsed = msgSchema.safeParse({ content: newContent });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid message content", error: parsed.error.format() },
        { status: 400 }
      );
    }

    const message = await MessageModel.findById(messageId);
    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    // Ensure only the receiver can update the message
    if (message.resiver.toString() !== session.user._id) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to update this message" },
        { status: 403 }
      );
    }

    // Update message content
    message.text = parsed.data.content;
    await message.save();

    return NextResponse.json(
      { success: true, message: "Message updated successfully", data: message },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}