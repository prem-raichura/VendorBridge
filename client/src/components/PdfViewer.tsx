import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export function PdfViewer({ invoiceId }: { invoiceId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let revoke: string | null = null;
    let cancelled = false;
    setUrl(null);
    setError(null);

    (async () => {
      try {
        const res = await api.get(`/invoices/${invoiceId}/pdf`, { responseType: "blob" });
        if (cancelled) return;
        const blobUrl = URL.createObjectURL(res.data);
        revoke = blobUrl;
        setUrl(blobUrl);
      } catch {
        if (!cancelled) setError("Failed to load invoice PDF");
      }
    })();

    return () => {
      cancelled = true;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [invoiceId]);

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground" style={{ height: "70vh" }}>
        {error}
      </div>
    );
  }

  if (!url) return <Skeleton className="w-full rounded-lg" style={{ height: "70vh" }} />;

  return (
    <iframe
      src={url}
      className="w-full rounded-lg border bg-white"
      style={{ height: "70vh" }}
      title="Invoice PDF"
    />
  );
}
