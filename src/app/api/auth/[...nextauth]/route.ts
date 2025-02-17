import NextAuth from "next-auth";
import { authOptions } from "./options";

const handlear = NextAuth(authOptions)

export {handlear as GET , handlear as POST}