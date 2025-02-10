import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import userModel from "@/models/User";
import { getServerSession, User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ messageid: string }> }
) {
  const { messageid } = await params;
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
  }catch (error: unknown) {
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
