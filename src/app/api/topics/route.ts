import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbconnect";
import TopicModel from "@/models/Topic";
import { ApiResponse } from "@/types/ApiRespoonse";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import UserModel from "@/models/User";
import { topicSchema } from "@/schemas/topicsShema";
import { z } from "zod";

// Helper to create API responses with appropriate HTTP status codes
const createResponse = (
  success: boolean,
  message: string,
  extra?: Partial<ApiResponse>,
  statusCode?: number
) =>
  NextResponse.json(
    { success, message, ...extra },
    { status: statusCode || (success ? 200 : 400) }
  );

// Authentication middleware function
const authenticateUser = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      authenticated: false,
      error: createResponse(
        false,
        "You are not authenticated",
        { error: "Unauthorized" },
        401
      ),
    };
  }
  return { authenticated: true, userId: session.user._id as string };
};

// Get all topics for the authenticated user
export async function GET() {
  await dbConnect();

  const auth = await authenticateUser();
  if (!auth.authenticated) return auth.error;

  try {
    const userWithTopics = await UserModel.findById(auth.userId).populate(
      "topics"
    );

    if (!userWithTopics)
      return createResponse(
        false,
        "User not found",
        { error: "Not Found" },
        404
      );

    return createResponse(true, "Topics fetched successfully", {
      data: userWithTopics.topics,
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    return createResponse(
      false,
      "Failed to fetch topics",
      { error: "Internal Server Error" },
      500
    );
  }
}

// Create a new topic for the user
export async function POST(req: NextRequest) {
  await dbConnect();

  const auth = await authenticateUser();
  if (!auth.authenticated) return auth.error;

  try {
    const data: {
      title: string;
    } = await req.json();
    const topicData = topicSchema.parse(data);

    const user = await UserModel.findById(auth.userId);
    if (!user)
      return createResponse(
        false,
        "User not found",
        { error: "Not Found" },
        404
      );

    const topic = await TopicModel.create(topicData);

    user.topics.push(topic._id);
    await user.save();

    return createResponse(
      true,
      "Topic created successfully",
      { data: topic },
      201
    );
  } catch (error) {
    console.error("Error creating topic:", error);

    if (error instanceof z.ZodError) {
      return createResponse(
        false,
        "Invalid topic data",
        {
          error: "Validation Error",
        },
        422
      );
    }

    return createResponse(
      false,
      "Failed to create topic",
      { error: "Internal Server Error" },
      500
    );
  }
}

// Delete a topic from the user
export async function DELETE(req: NextRequest) {
  await dbConnect();

  const auth = await authenticateUser();
  if (!auth.authenticated) return auth.error;

  try {
    const data = await req.json();

    // Validate request data
    const deleteSchema = z.object({
      topicId: z.string().min(1, "Topic ID is required"),
    });

    const { topicId } = deleteSchema.parse(data);

    // Perform operation in a more efficient way
    const user = await UserModel.findByIdAndUpdate(
      auth.userId,
      { $pull: { topics: topicId } },
      { new: true }
    );

    if (!user)
      return createResponse(
        false,
        "User not found",
        { error: "Not Found" },
        404
      );

    const deleteResult = await TopicModel.deleteOne({ _id: topicId });

    if (deleteResult.deletedCount === 0) {
      return createResponse(
        false,
        "Topic not found",
        { error: "Not Found" },
        404
      );
    }

    return createResponse(true, "Topic deleted successfully");
  } catch (error) {
    console.error("Error deleting topic:", error);

    if (error instanceof z.ZodError) {
      return createResponse(
        false,
        "Invalid request data",
        {
          error: error.errors[0].message,
        },
        422
      );
    }

    return createResponse(
      false,
      "Failed to delete topic",
      { error: "Internal Server Error" },
      500
    );
  }
}

// Update a topic title
export async function PUT(req: NextRequest) {
  await dbConnect();

  const auth = await authenticateUser();
  if (!auth.authenticated) return auth.error;

  try {
    const data = await req.json();

    // Validate request data
    const updateSchema = z.object({
      topicId: z.string().min(1, "Topic ID is required"),
      newTitle: z.string().min(1, "New title is required"),
    });

    const { topicId, newTitle } = updateSchema.parse(data);

    // Check if topic belongs to user
    const user = await UserModel.findOne({
      _id: auth.userId,
      topics: topicId,
    });

    if (!user)
      return createResponse(
        false,
        "Topic not found or access denied",
        { error: "Not Found" },
        404
      );

    // Update the topic
    const updatedTopic = await TopicModel.findByIdAndUpdate(
      topicId,
      { title: newTitle },
      { new: true }
    );

    if (!updatedTopic)
      return createResponse(
        false,
        "Failed to update topic",
        { error: "Not Found" },
        404
      );

    return createResponse(true, "Topic updated successfully", {
      data: updatedTopic,
    });
  } catch (error) {
    console.error("Error updating topic:", error);

    if (error instanceof z.ZodError) {
      return createResponse(
        false,
        "Invalid request data",
        {
          error: error.errors[0].message,
        },
        422
      );
    }

    return createResponse(
      false,
      "Failed to update topic",
      { error: "Internal Server Error" },
      500
    );
  }
}
