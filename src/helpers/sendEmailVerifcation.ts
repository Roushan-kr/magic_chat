import { resend } from "@/lib/resend";
import { verificaitonEmail } from "../../emails/verifyEmailTemplate";
import { ApiResponse } from "@/types/ApiRespoonse";

type args = {
  username: string;
  verifyCode: string;
  email: string
};

export async function sendVerifyMail({
  username,
  verifyCode,
  email
}: args): Promise<ApiResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Admin <admin@devroush.tech>',
      to: email, // for non domain verifaction use regesterd mail
      subject: "Verify your email",
      react: await verificaitonEmail({ username, verifyCode }),
    });

    if (error) {
      return { success: false, message: "Failed to send email", error };
    }
    return { success: true, message: "Email sent successfully", data };
  } catch (error) {
    return { success: false, message: "Failed to send email", error };
  }
}
