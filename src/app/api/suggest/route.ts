import { msgSchema } from "@/schemas/messageSchema";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = (await req.json()) || {};
    
    if (!prompt) {
      return NextResponse.json({
        success: false,
        message: "Prompt is required",
      });
    }

    const parseMsg = msgSchema.safeParse({username:" " ,content: prompt });
    if (!parseMsg.success) {
      return NextResponse.json({
        success: false,
        message: parseMsg.error,
      });
    }

    const userPrompt = `${parseMsg.data.content} , now create a list of string response seprated by '|| ' using the above text like a suggesation with that context as user text response within a semarized manner that help them sayining that text in sorter collection of  words also remember it is response like text communaction act like a keybord suggestion don't include that text which i give prevous to you just give, use '||' saprated those sentence suggesation  overall act as comminication expert channel that sugest user message act like a google assistance which saperate their respone with '||' `;

    const result = streamText({
      model: google("gemini-1.5-pro-latest"
      //    ,{
      //   safetySettings: [
      //     {
      //       category: "HARM_CATEGORY_UNSPECIFIED",
      //       threshold: "BLOCK_LOW_AND_ABOVE",
      //     },
      //   ],
      // }
    ),
      maxTokens: 1000,
      prompt: userPrompt,
      temperature: 0.7,
    });
    // // for debuging
    // for await (const textPart of result.textStream) {
    //   console.log(textPart);
    // }
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error generating response:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
