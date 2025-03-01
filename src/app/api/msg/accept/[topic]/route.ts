import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbconnect";
import MessageModel from "@/models/Message";
import TopicModel from "@/models/Topic";
import userModel from "@/models/User";
import { msgSchema } from "@/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiRespoonse";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// Helper to create API responses
const createResponse = (
  success: boolean,
  message: string,
  extra?: Partial<ApiResponse>
) =>
  NextResponse.json(
    { success, message, ...extra },
    { status: success ? 200 : 400 }
  );

export async function GET(
  req: NextRequest,
  { params }: { params: { topic: string } }
) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return createResponse(false, "You are not authenticated", {
      error: "Unauthorized",
    });
  }

  const userId = session.user._id;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { receiver: new mongoose.Types.ObjectId(`${userId}`) };
    const utopic = params.topic;
    let messageIds: Types.ObjectId[] = [];

    if (utopic) {
      const topic = await TopicModel.findOne({
        title: utopic.toLowerCase().trim(),
      });
      if (!topic) return createResponse(false, "Topic not found");
      messageIds = topic.messages;
    }

    if (messageIds.length > 0) {
      filter._id = { $in: messageIds };
    }

    const messages = await MessageModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("text");

    const totalMessages = await MessageModel.countDocuments(filter);

    return createResponse(true, "Messages fetched successfully", {
      messages,
      data: {
        page,
        limit,
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
      },
    });
  } catch (error: unknown) {
    return createResponse(false, "Something went wrong", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return createResponse(false, "You are not authenticated", {
      error: "Unauthorized",
    });
  }

  const { messageId } = await req.json();
  if (!messageId) {
    return createResponse(false, "Message ID is required", {
      error: "Missing messageId",
    });
  }

  try {
    const message = await MessageModel.findOne({
      _id: messageId,
      receiver: session.user._id,
    });
    if (!message)
      return createResponse(
        false,
        "Message not found or not authorized to delete"
      );

    await MessageModel.deleteOne({ _id: messageId });
    await TopicModel.updateMany({}, { $pull: { messages: messageId } });

    return createResponse(true, "Message deleted successfully");
  } catch (error: unknown) {
    return createResponse(false, "Something went wrong", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const { receiverId, content, topicTitle } = await req.json();

  // Validate input
  const parsed = msgSchema.safeParse({ content });
  if (!parsed.success) {
    return createResponse(false, "Invalid message content", {
      error: parsed.error.format(),
    });
  }

  try {
    const receiver = await userModel.findById(receiverId);
    if (!receiver) {
      return createResponse(false, "Receiver not found");
    }

    if (!receiver.allowMessages) {
      return createResponse(false, "Receiver is not accepting messages");
    }

    // Find or create the topic
    let topic = await TopicModel.findOne({
      title: topicTitle.toLowerCase().trim(),
    });
    if (!topic) {
      topic = await TopicModel.create({ title: topicTitle, messages: [] });
    }

    const newMessage = await MessageModel.create({
      text: parsed.data.content,
      receiver: receiverId,
      createdAt: new Date(),
    });

    await TopicModel.updateOne(
      { _id: topic._id },
      { $push: { messages: newMessage._id } }
    );

    return createResponse(true, "Message sent successfully", {
      data: newMessage,
    });
  } catch (error: unknown) {
    return createResponse(false, "Something went wrong", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return createResponse(false, "You are not authenticated", {
      error: "Unauthorized",
    });
  }

  const { messageId, newContent } = await req.json();
  if (!messageId || !newContent) {
    return createResponse(false, "Message ID and new content are required", {
      error: "Missing parameters",
    });
  }

  // Validate new content
  const parsed = msgSchema.safeParse({ content: newContent });
  if (!parsed.success) {
    return createResponse(false, "Invalid message content", {
      error: parsed.error.format(),
    });
  }

  try {
    const message = await MessageModel.findOne({
      _id: messageId,
      receiver: session.user._id,
    });
    if (!message)
      return createResponse(
        false,
        "Message not found or not authorized to update"
      );

    message.text = parsed.data.content;
    await message.save();

    return createResponse(true, "Message updated successfully", {
      data: message,
    });
  } catch (error: unknown) {
    return createResponse(false, "Something went wrong", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
