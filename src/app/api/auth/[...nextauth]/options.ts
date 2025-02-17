import { NextAuthOptions } from "next-auth";
import CrediantialProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbconnect";
import userModel from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CrediantialProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { lable: "Email", type: "text", placeholder: "Enter Email" },
        username: {
          lable: "username",
          type: "text",
          placeholder: "Enter username",
        },
        password: { label: "password", type: "password" },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async authorize(Credential: any): Promise<any> {
        dbConnect();
        try {
          const user = await userModel.findOne({
            $or: [
              { email: Credential.identifier },
              { uname: Credential?.identifier },
            ],
          });
          if (!user) {
            throw new Error("No user found");
          }
          if (!user.verified) {
            throw new Error("User is not verified");
          }
          const isValid = user.comparePassword(Credential.password);

          if (!isValid) {
            throw new Error("Password is incorrect");
          }
          return user;
        } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          console.log(error);
          throw new Error("An unknown error occurred");
        }
      },
    }),
  ],
  callbacks: {
    // may run sequesntialy
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.verified = user.verified;
        token.allowMessages = user.allowMessages;
        token.username = user.uname;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.allowMessages = token.allowMessages;
        session.user.verified = token.verified;
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
};
