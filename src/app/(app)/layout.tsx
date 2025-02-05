import Navbar from "@/components/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/sign-in");
  }


  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {children}
    </div>
  );
}
