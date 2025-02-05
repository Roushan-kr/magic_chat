import { msgSchema } from "@/schemas/messageSchema";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json() || {};

    if (!prompt) {
      return NextResponse.json({
        success: false,
        message: "Prompt is required",
      });
    }
    
    const parseMsg = msgSchema.safeParse({content: prompt})

    if(!parseMsg.success){
      return NextResponse.json({
        success:false,
        message: parseMsg.error
      })
    }

    const userPrompt = `${parseMsg.data.content} , now create a list of string response seprated by ',' using the above text like a suggesation with that context as user text response within 5 to 10 words aslo remeber it is response that a user feeback is given to another user reaction/work ensure user get best of what they write `;

    const result = await streamText({
      model: openai("gpt-4o"),
      maxTokens: 300,
      prompt:userPrompt,
      temperature:0.7
    });
    
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error generating response:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
