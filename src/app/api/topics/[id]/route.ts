import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import TopicModel from "@/models/Topic";
import { ApiResponse } from "@/types/ApiRespoonse";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { createMessageSchema, updateMessageSchema } from "@/schemas/topicsShema";
import mongoose, { Types } from "mongoose";
import MessageModel from "@/models/Message";
import dbConnect from "@/lib/dbconnect";

// Helper to create API responses
const createResponse = (
  success: boolean,
  message: string,
  extra?: Partial<ApiResponse>,
  status?: number
) =>
  NextResponse.json(
    { success, message, ...extra },
    { status: status || (success ? 200 : 400) }
  );

// Get a specific topic by ID
export async function GET(
  _request: NextRequest, 
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const topicId = params.id;

  try {
    if (!mongoose.isValidObjectId(topicId)) {
      return createResponse(false, "Invalid topic ID", {}, 400);
    }

    const topic = await TopicModel.findById(topicId).populate("messages");
    
    if (!topic) {
      return createResponse(false, "Topic not found", {}, 404);
    }
    
    return createResponse(true, "Topic fetched successfully", {
      data: topic,
    });
  } catch (error) {
    console.error("Error fetching topic:", error);
    return createResponse(false, "Failed to fetch topic", { error: String(error) }, 500);
  }
}

// Add a new message to a topic (no authentication required)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const topicId = params.id;
  
  try {
    if (!mongoose.isValidObjectId(topicId)) {
      return createResponse(false, "Invalid topic ID", {}, 400);
    }

    const body = await request.json();
    
    // Validate message data
    const validationResult = createMessageSchema.safeParse(body);
    if (!validationResult.success) {
      return createResponse(false, "Invalid message data", { 
        error: validationResult.error.format() 
      }, 400);
    }
    
    const validatedData = validationResult.data;
    
    const topic = await TopicModel.findById(topicId);
    if (!topic) {
      return createResponse(false, "Topic not found", {}, 404);
    }
    
    // Create a new message using the Message model
    const newMessage = new MessageModel({
      text: validatedData.content,
      createdAt: new Date(),
      receiver: new Types.ObjectId(topic._id), // Convert to ObjectId
    });
    
    // Save the message
    const savedMessage = await newMessage.save();
    
    // Add message reference to topic correctly
    if (!topic.messages) {
      topic.messages = [];
    }
    
    // Push the ObjectId, not the whole message
    topic.messages.push(savedMessage._id);
    await topic.save();
    
    return createResponse(true, "Message added successfully", {
      data: savedMessage,
    }, 201);
  } catch (error) {
    console.error("Error adding message:", error);
    return createResponse(false, "Failed to add message", { error: String(error) }, 500);
  }
}

// Update a message in a topic
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return createResponse(false, "You are not authenticated", {
      error: "Unauthorized",
    }, 401);
  }
  
  const topicId = params.id;
  
  try {
    if (!mongoose.isValidObjectId(topicId)) {
      return createResponse(false, "Invalid topic ID", {}, 400);
    }

    const body = await request.json();
    
    // Validate update data
    const validationResult = updateMessageSchema.safeParse(body);
    if (!validationResult.success) {
      return createResponse(false, "Invalid message data", { 
        error: validationResult.error.format() 
      }, 400);
    }
    
    const { messageId, content } = validationResult.data;
    
    // Check if topic exists and contains the message
    const topic = await TopicModel.findOne({
      _id: topicId,
      messages: messageId
    });
    
    if (!topic) {
      return createResponse(false, "Topic or message not found", {}, 404);
    }
    
    // Update the message directly using the Message model
    const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      { text: content },
      { new: true }
    );
    
    if (!updatedMessage) {
      return createResponse(false, "Message not found", {}, 404);
    }
    
    return createResponse(true, "Message updated successfully", {
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Error updating message:", error);
    return createResponse(false, "Failed to update message", { error: String(error) }, 500);
  }
}

// Delete a message from a topic
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return createResponse(false, "You are not authenticated", {
      error: "Unauthorized",
    }, 401);
  }
  
  const topicId = params.id;
  if (!mongoose.isValidObjectId(topicId)) {
    return createResponse(false, "Invalid topic ID", {}, 400);
  }

  const url = new URL(request.url);
  const messageId = url.searchParams.get("messageId");
  
  if (!messageId || !mongoose.isValidObjectId(messageId)) {
    return createResponse(false, "Valid message ID is required", {}, 400);
  }
  
  try {
    // Remove message reference from topic
    await TopicModel.findByIdAndUpdate(
      topicId,
      { $pull: { messages: messageId } },
      { new: true }
    );
    
    // Delete the actual message
    const deleteResult = await MessageModel.deleteOne({ _id: messageId });
    
    if (deleteResult.deletedCount === 0) {
      return createResponse(false, "Message not found", {}, 404);
    }
    
    return createResponse(true, "Message deleted successfully", {}, 200);
  } catch (error) {
    console.error("Error deleting message:", error);
    return createResponse(false, "Failed to delete message", { error: String(error) }, 500);
  }
}
