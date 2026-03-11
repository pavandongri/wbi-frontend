"use client";

import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";

import Link from "next/link";

const drawerWidth = 240;

const menuItems = [
  { text: "Home", icon: <HomeIcon />, href: "/" },
  { text: "Profile", icon: <PersonIcon />, href: "/profile" },
  { text: "Dashboard", icon: <DashboardIcon />, href: "/dashboard" }
];

export default function Sidebar({
  mobileOpen,
  onClose
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const drawerContent = (
    <>
      <Toolbar />

      <List>
        {menuItems.map((item) => (
          <ListItemButton key={item.text} component={Link} href={item.href} onClick={onClose}>
            <ListItemIcon>{item.icon}</ListItemIcon>

            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth
          }
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
