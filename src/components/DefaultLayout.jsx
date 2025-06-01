// src/components/ToolpadLayout.jsx
import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TimelineIcon from "@mui/icons-material/Timeline";
import { createTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";

const NAVIGATION = [
  { kind: "header", title: "Main" },
  { segment: "users", title: "Usuarios", icon: <DashboardIcon /> },
  { segment: "properties", title: "Propiedades", icon: <TimelineIcon /> },
];

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
});

export default function ToolpadLayout() {
  const location = useLocation();

  return (
    <AppProvider navigation={NAVIGATION} theme={theme}>
      <DashboardLayout>
        <Box sx={{ p: 2 }}>
          <Outlet />
        </Box>
      </DashboardLayout>
    </AppProvider>
  );
}
