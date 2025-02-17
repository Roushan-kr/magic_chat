import "next-auth";

declare module "next-auth" {
  interface User {
    _id?: string;
    uname?: string;
    allowMessages?: boolean;
    verified?: boolean;
  }
  interface Session {
    user: {
      _id?: string;
      username?: string;
      allowMessages?: boolean;
      verified?: boolean;
    } & DefaultSession['user']
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    username?: string;
    allowMessages?: boolean;
    verified?: boolean;
  }
}
