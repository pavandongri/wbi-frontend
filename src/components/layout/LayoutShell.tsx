"use client";

import { Box, Toolbar } from "@mui/material";
import { useState } from "react";

import Footer from "./Footer";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const drawerWidth = 240;

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuClick = () => {
    setMobileOpen(true);
  };

  const handleClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Navbar onMenuClick={handleMenuClick} />

      <Sidebar mobileOpen={mobileOpen} onClose={handleClose} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: `${drawerWidth}px` },
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh"
        }}
      >
        <Toolbar />

        <Box sx={{ flexGrow: 1, p: 3 }}>{children}</Box>

        <Footer />
      </Box>
    </Box>
  );
}
