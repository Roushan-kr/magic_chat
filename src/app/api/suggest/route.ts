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

    const userPrompt = `${parseMsg.data.content}. Now create a list of string responses separated by '||'. Use the above text as a suggestion context. Summarize the text to help the user say it in a shorter collection of words. Remember, it is a response like text communication, acting like a keyboard suggestion. Do not include the text I gave you previously. Just provide the suggestions separated by '||'. Act as a communication expert channel that suggests user messages like Google Assistant.`;

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

// File locked to prevent further changes
