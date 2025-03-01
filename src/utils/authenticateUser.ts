import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import { getServerSession } from "next-auth";

export async function authenticateUser() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!session || !user) {
    return null;
  }
  return user;
}
