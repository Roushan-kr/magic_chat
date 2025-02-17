import { z } from "zod";

export const msgSchema = z.object({
  username: z.string().min(1, "Username is required"),
  content: z.string().min(1, "Message must be at least 1 character").max(1000, "Message must be at most 1000 characters"),
});
