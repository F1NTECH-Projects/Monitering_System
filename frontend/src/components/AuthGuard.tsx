"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/stores/authStore";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAuth((s) => s.token);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!token && pathname !== "/login") router.replace("/login");
  }, [token, pathname, router]);

  if (!token && pathname !== "/login") return null;
  return <>{children}</>;
}
