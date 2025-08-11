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
  colorSchemes: {
    light: {
      palette: {
        mode: "light",
        primary: {
          main: "#004AAD", // Azul inmobiliario profesional
        },
        secondary: {
          main: "#F9A825", // Amarillo dorado para acentos
        },
        background: {
          default: "#F9FAFB", // Fondo general claro
          paper: "#FFFFFF", // Fondo de tarjetas y contenedores
        },
        text: {
          primary: "#1F2937", // Gris oscuro (casi negro)
          secondary: "#4B5563",
        },
      },
    },
    dark: {
      palette: {
        mode: "dark",
        primary: {
          main: "#9CA3AF", // Gris claro para buen contraste
        },
        secondary: {
          main: "#FBC02D", // Amarillo suave para acentos
        },
        background: {
          default: "#1F2937", // Fondo gris muy oscuro
          paper: "#111827", // Fondo para tarjetas
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#D1D5DB",
        },
      },
    },
  },
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
        title: <span className="text-orange-500">INMOBILIARIA</span>,
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
              overflowX: "hidden", // oculta scroll horizontal global
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
