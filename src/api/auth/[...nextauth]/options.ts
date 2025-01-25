import { NextAuthOptions } from "next-auth";
import CrediantialProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbconnect";
import userModel from "@/models/User";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CrediantialProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { lable: "Email", type: "text", placeholder: "Enter Email" },
        password: { label: "password", type: "password" },
      },
      async authorize(Credential: any): Promise<any> {
        dbConnect();
        try {
          const user = await userModel.findOne({
            $or: [{ email: Credential.email }, { uname: Credential.username }],
          });
          if (!user) {
            throw new Error("No user found");
          }
          if (!user.isVerified) {
            throw new Error("User is not verified");
          }
          const isValid = bcrypt.compare(Credential.password, user.password);

          if (!isValid) {
            throw new Error("Password is incorrect");
          }
          return user;
        } catch (error: any) {
          throw new Error(error);
        }
      },
    }),
  ],
  callbacks:{
    async jwt({token, user}) {
        if(user){
            token._id = user._id?.toString()
            token.isVerified = user.isVerified;
            token.isAcceptingMessage = user.isAcceptingMessage
            token.username = user.uname
        }
        return token
    },
    async session({session, token}){
        if(token){
            session.user._id = token._id
            session.user.isAcceptingMessage= token.isAcceptingMessage
            session.user.isVerified = token.isVerified
            session.user.username= token.username
        }
        return session
    }

  },
  pages:{
    signIn:"/sign-in"
  },
  session:{
    strategy:"jwt"
  },
  secret: process.env.AUTH_SECRET,
};
