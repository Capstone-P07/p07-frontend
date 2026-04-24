"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const PUBLIC_PATHS = ["/login", "/signup"];
const ADMIN_PATHS = ["/admin"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const isPublic = PUBLIC_PATHS.includes(pathname);
    const isAdmin = pathname.startsWith("/admin");

    if (!token && !isPublic && !isAdmin) { //admin 페이지 로그인 생략
      router.replace("/login");
    }
  }, [pathname, router]);

  return <>{children}</>;
}