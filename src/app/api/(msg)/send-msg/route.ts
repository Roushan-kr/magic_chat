import dbConnect from "@/lib/dbconnect";
import userModel,{Message} from "@/models/User";
import { msgSchema } from "@/schemas/messageSchema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();

  const { username, content } = await req.json();
  try {
    const msg = msgSchema.safeParse({content});
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
    if(!user.isAcceptingMessage){
        return NextResponse.json(
            {
              message: "user not accepting msg",
              success: true,
            },
            { status: 403 }
          );
    }
    
    user.messages.push({content:msg.data.content , createdAt:new Date()} as Message);
    
    await user.save();
    return NextResponse.json(
        {
          message: "msg sent success",
          success: true,
        },
        { status: 200 }
      );
   
   
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message || "somting went worng",
        success: false,
      },
      { status: 500 }
    );
  }
}
