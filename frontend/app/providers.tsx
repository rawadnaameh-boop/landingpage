"use client";

import type { ReactNode } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import {theme} from "../theme/theme";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({
  children,
}: ProvidersProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}