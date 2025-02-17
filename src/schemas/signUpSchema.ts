import { z } from "zod";

export const userNameValidation = z
  .string()
  .min(3, "UserName must be atlest 2 char Long")
  .max(10, "UserName must be atmost 10 char Long")
  .regex(
    /^[a-zA-Z0-9_]*$/,
    "UserName must contain only alphabets, numbers and underscore"
  );

export const signUpSchema = z.object({
  username: userNameValidation,
  email: z.string().email({message:"Invalid email !!"}),
  password: z.string().min(8, "Password must be atleast 8 char long"),
});
