import "next-auth";

declare module "next-auth" {
  interface User {
    _id?: string;
    uname?: string;
    isAcceptingMessage?: boolean;
    isVerified?: boolean;
  }
  interface Session {
    user: {
      _id?: string;
      username?: string;
      isAcceptingMessage?: boolean;
      isVerified?: boolean;
    } & DefaultSession['user']
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    username?: string;
    isAcceptingMessage?: boolean;
    isVerified?: boolean;
  }
}
