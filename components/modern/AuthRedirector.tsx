"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthRedirector() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      if (session.user.role === "ADMIN") {
        if (!window.location.pathname.startsWith("/admin")) {
          router.replace("/admin/dashboard");
        }
      } else if (session.user.role === "SELLER") {
        if (!window.location.pathname.startsWith("/seller")) {
          router.replace("/seller/dashboard");
        }
      } else if (session.user.role === "BUYER") {
        // Only redirect if trying to access admin or seller pages
        if (
          window.location.pathname.startsWith("/admin") ||
          window.location.pathname.startsWith("/seller")
        ) {
          router.replace("/");
        }
      }
    }
  }, [session, status, router]);

  return null;
} 