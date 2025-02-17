import { z } from "zod";

export const acceptMsgSchema = z.object({
  allowMessages: z.boolean(),
});
