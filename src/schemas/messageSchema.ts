import { z } from "zod";

export const msgSchema = z.object({
  content: z.string()
  .min(1, "Message must be atleast 1 char long")
  .max(1000, "Message must be atmost 1000 char long"),
});
