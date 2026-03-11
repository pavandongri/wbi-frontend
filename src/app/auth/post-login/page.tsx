"use client";

import { setUser } from "@/helpers/common.helpers";
import { User } from "@/types/common.types";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PostLoginPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const userProfile: User = {
        id: user.sub,
        name: user.name ?? "",
        email: user.email ?? "",
        picture: user.picture ?? ""
      };

      setUser(userProfile);

      router.replace("/");
    }
  }, [user, isLoading, router]);

  return null;
}
