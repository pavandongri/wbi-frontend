"use client";

import { Box, Toolbar } from "@mui/material";
import { useState } from "react";

import AccessGuard from "./AccessGuard";
import Footer from "./Footer";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const drawerWidth = 240;
const collapsedDrawerWidth = 84;

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleMenuClick = () => {
    setMobileOpen(true);
  };

  const handleClose = () => {
    setMobileOpen(false);
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const desktopDrawerWidth = isSidebarCollapsed ? collapsedDrawerWidth : drawerWidth;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Navbar onMenuClick={handleMenuClick} />

      <Sidebar
        mobileOpen={mobileOpen}
        onClose={handleClose}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleSidebarToggle}
        desktopWidth={desktopDrawerWidth}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          minWidth: 0,
          bgcolor: "background.default"
        }}
      >
        <Toolbar />

        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
          <AccessGuard>{children}</AccessGuard>
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}
