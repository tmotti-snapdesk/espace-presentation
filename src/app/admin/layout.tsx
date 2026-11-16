"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setChecked(true);
      setAuthenticated(true);
      return;
    }

    fetch("/api/auth")
      .then((res) => {
        if (res.ok) {
          setAuthenticated(true);
        } else {
          router.replace("/admin/login");
        }
      })
      .catch(() => {
        router.replace("/admin/login");
      })
      .finally(() => {
        setChecked(true);
      });
  }, [isLoginPage, router]);

  if (!checked || (!authenticated && !isLoginPage)) {
    return (
      <div className="min-h-screen bg-luxury-cream flex items-center justify-center">
        <p className="text-luxury-slate">Chargement...</p>
      </div>
    );
  }

  return <>{children}</>;
}
