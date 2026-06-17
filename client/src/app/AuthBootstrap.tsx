import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/lib/auth";
import { BASE_URL } from "@/lib/api";
import { FullPageSpinner } from "@/components/ui/spinner";

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const logout = useAuthStore((s) => s.logout);
  const [ready, setReady] = useState(!user || !!accessToken);

  useEffect(() => {
    if (ready) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        if (!cancelled) setAccessToken(data.accessToken);
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, setAccessToken, logout]);

  if (!ready) return <FullPageSpinner label="Loading session..." />;
  return <>{children}</>;
}
