"use client";

import { AppBar, Box, IconButton, Toolbar } from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import Logo from "../Logo";
import ProfileMenu from "../ProfileMenu";

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <AppBar position="fixed" color="inherit" elevation={1} sx={{ zIndex: 1300 }}>
      <Toolbar>
        <IconButton edge="start" onClick={onMenuClick} sx={{ mr: 2, display: { md: "none" } }}>
          <MenuIcon />
        </IconButton>

        <Logo />

        <Box flexGrow={1} />

        <ProfileMenu />
      </Toolbar>
    </AppBar>
  );
}
