import { z } from "zod";

export const verifySchema = z.object({
  verifyCode: z
    .string()
    .min(6, "Verification code must be atleast 6 char long")
    .max(6, "Verification code must be atmost 6 char long")
    .regex(/^[0-9]*$/, "Verification code must contain only numbers"),
});
