import React from "react";
import { InboxIcon } from "lucide-react";

export function EmptyState({ title = "No data", description }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <InboxIcon className="h-12 w-12 mb-4 opacity-40" />
      <p className="font-medium">{title}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
    </div>
  );
}
