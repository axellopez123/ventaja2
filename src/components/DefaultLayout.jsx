// src/components/ToolpadLayout.jsx
import * as React from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TimelineIcon from "@mui/icons-material/Timeline";
import { createTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { useStateContext } from "../contexts/ContextProvider";
import { RiHomeHeartFill } from "react-icons/ri";

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
  const { user, token, notification, setUser, setToken } = useStateContext();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <AppProvider
      navigation={NAVIGATION}
      branding={{
        // logo: <img src="https://mui.com/static/logo.png" alt="MUI logo" />,
        logo: <RiHomeHeartFill />,
        title: "INMOBILIARIA ",
        homeUrl: "/",
      }}
      theme={theme}
    >
      <DashboardLayout>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100vh", // ✅ altura total de viewport
            overflow: "hidden",
          }}
        >
          <Box
            id="scrollableDiv" // 👈 este será tu objetivo de scroll
            sx={{
              flex: 1,
              overflowY: "auto", // ✅ solo esta área tiene scroll
              px: 2,
              py: 3,
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </DashboardLayout>
    </AppProvider>
  );
}
