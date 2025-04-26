"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  // Only render children after first client-side render
  // This prevents hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <NextThemesProvider {...props} enableSystem={true} enableColorScheme={false}>
      {mounted ? children : <div style={{ visibility: "hidden" }}>{children}</div>}
    </NextThemesProvider>
  );
} 