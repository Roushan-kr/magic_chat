import { isValidObjectId } from "mongoose";
import { z } from "zod";

// Define message schema to match the MongoDB model
export const messageSchema = z.object({
  text: z.string().nonempty("Message text is required"),
  receiver: z.string().refine(val => isValidObjectId(val), {
    message: "Invalid receiver ID"
  }),
  createdAt: z.date().default(() => new Date()),
});

export const topicSchema = z.object({
    title: z.string().nonempty("Title is required").toLowerCase(),
    messages: z.array(z.string().refine(val => isValidObjectId(val), {
      message: "Invalid message ID"
    })).default([]),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().optional(),
});

// Form validation schemas
export const searchFormSchema = z.object({
  searchTerm: z.string().optional(),
});

export const createFormSchema = z.object({
  topicTitle: z.string().min(1, "Topic name is required"),
});

// Message validation schemas - simplified for client use
export const createMessageSchema = z.object({
  content: z.string().nonempty("Message content is required"),
  sender: z.string().optional().default("Anonymous"),
});

export const updateMessageSchema = z.object({
  messageId: z.string().refine((val) => isValidObjectId(val), {
    message: "Invalid message ID",
  }),
  content: z.string().nonempty("Message content is required"),
});
