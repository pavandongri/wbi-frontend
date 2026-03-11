import { setUser } from "@/helpers/common.helpers";
import { auth0 } from "@/lib/auth0";
import { User } from "@/types/common.types";
import { redirect } from "next/navigation";

export default async function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = await auth0.getSession();

  const user: User | null = session?.user
    ? {
        id: session?.user?.sub ?? "",
        name: session?.user?.name ?? "",
        email: session?.user?.email ?? "",
        picture: session?.user?.picture ?? ""
      }
    : null;

  if (!user) {
    redirect("/auth/login?returnTo=/auth/post-login");
  }

  setUser(user);

  return <>{children}</>;
}
