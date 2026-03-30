"use client";

import { JSONUIProvider } from "@json-render/react";
import { registry } from "@/lib/render-setup";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JSONUIProvider registry={registry}>
      {children}
    </JSONUIProvider>
  );
}
