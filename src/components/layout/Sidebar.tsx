"use client";

import { logoutUser } from "@/helpers/common.helpers";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { alpha, useTheme } from "@mui/material/styles";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonIcon from "@mui/icons-material/Person";

import Link from "next/link";
import { usePathname } from "next/navigation";

const drawerWidth = 240;

const menuItems = [
  { text: "Home", icon: <HomeIcon />, href: "/" },
  { text: "Profile", icon: <PersonIcon />, href: "/profile" },
  { text: "Dashboard", icon: <DashboardIcon />, href: "/dashboard" }
];

export default function Sidebar({
  mobileOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  desktopWidth
}: {
  mobileOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  desktopWidth: number;
}) {
  const pathname = usePathname();
  const theme = useTheme();
  const sidebarEasing = "cubic-bezier(0.22, 1, 0.36, 1)";
  const drawerTransitionDuration = 320;
  const labelTransitionDuration = 220;
  const iconSlotWidth = 24;
  const itemHorizontalPadding = 1.5;
  const expandedIconGap = 1.5;
  const expandedContentWidth = `calc(100% - ${theme.spacing(itemHorizontalPadding * 2 + iconSlotWidth / 8 + expandedIconGap)})`;

  const itemIconStyles: SxProps<Theme> = {
    minWidth: theme.spacing(iconSlotWidth / 8),
    width: theme.spacing(iconSlotWidth / 8),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "text.secondary",
    flexShrink: 0
  };

  const getItemLabelStyles = (collapsed: boolean): SxProps<Theme> => ({
    width: collapsed ? 0 : expandedContentWidth,
    maxWidth: collapsed ? 0 : expandedContentWidth,
    minWidth: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    opacity: collapsed ? 0 : 1,
    transform: collapsed ? "translateX(-6px)" : "translateX(0)",
    transition: [
      theme.transitions.create("max-width", {
        duration: drawerTransitionDuration,
        easing: sidebarEasing
      }),
      theme.transitions.create(["opacity", "transform"], {
        duration: labelTransitionDuration,
        delay: collapsed ? 0 : 70,
        easing: sidebarEasing
      })
    ].join(", "),
    "& .MuiTypography-root": {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  });

  const renderDrawerContent = ({ collapsed }: { collapsed: boolean }) => (
    <Box sx={{ height: "100%", px: 1.5, pt: 1.5, pb: 2, display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          minHeight: 56,
          px: 1,
          mb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between"
        }}
      >
        {!collapsed && (
          <Typography variant="subtitle1" color="text.secondary">
            Navigation
          </Typography>
        )}
      </Box>

      <List sx={{ pt: 0.5 }}>
        {menuItems.map((item) => (
          <Tooltip key={item.text} title={collapsed ? item.text : ""} placement="right">
            <ListItemButton
              component={Link}
              href={item.href}
              onClick={onClose}
              selected={pathname === item.href}
              sx={{
                minHeight: 46,
                px: 1.5,
                justifyContent: "flex-start",
                "&.Mui-selected": {
                  bgcolor: "action.selected",
                  color: "primary.main",
                  "& .MuiListItemIcon-root": {
                    color: "primary.main"
                  }
                }
              }}
            >
              <ListItemIcon
                sx={{
                  ...itemIconStyles,
                  mr: collapsed ? 0 : 1.5,
                  transition: theme.transitions.create("margin-right", {
                    duration: drawerTransitionDuration,
                    easing: sidebarEasing
                  })
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText primary={item.text} sx={getItemLabelStyles(collapsed)} />
            </ListItemButton>
          </Tooltip>
        ))}
      </List>

      <Box
        sx={{
          mt: "auto",
          minHeight: 64,
          display: "flex",
          alignItems: "center",
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Tooltip title={collapsed ? "Logout" : ""} placement="right">
          <ListItemButton
            onClick={logoutUser}
            sx={{
              minHeight: "100%",
              width: "100%",
              px: 1.5,
              justifyContent: "flex-start",
              color: "error.main",
              "& .MuiListItemIcon-root": {
                color: "error.main"
              },
              "&:hover": {
                bgcolor: alpha(theme.palette.error.main, 0.08)
              }
            }}
          >
            <ListItemIcon
              sx={{
                ...itemIconStyles,
                mr: collapsed ? 0 : 1.5,
                transition: theme.transitions.create("margin-right", {
                  duration: drawerTransitionDuration,
                  easing: sidebarEasing
                })
              }}
            >
              <LogoutRoundedIcon />
            </ListItemIcon>

            <ListItemText primary="Logout" sx={getItemLabelStyles(collapsed)} />
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            position: "relative",
            width: desktopWidth,
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.paper",
            boxSizing: "border-box",
            transition: theme.transitions.create("width", {
              duration: drawerTransitionDuration,
              easing: sidebarEasing
            }),
            overflowX: "visible",
            overflowY: "auto"
          }
        }}
        open
      >
        {renderDrawerContent({ collapsed: isCollapsed })}
      </Drawer>

      <Tooltip title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
        <IconButton
          onClick={onToggleCollapse}
          size="small"
          sx={{
            position: "fixed",
            top: "50%",
            left: `${desktopWidth - 18}px`,
            transform: "translateY(-50%)",
            transition: theme.transitions.create(["left", "background-color", "box-shadow"], {
              duration: drawerTransitionDuration,
              easing: sidebarEasing
            }),
            zIndex: (muiTheme) => muiTheme.zIndex.drawer + 2,
            display: { xs: "none", md: "inline-flex" },
            width: 36,
            height: 36,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.paper",
            boxShadow: "0 8px 24px rgba(17, 27, 33, 0.14)",
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              boxShadow: "0 10px 28px rgba(17, 27, 33, 0.18)"
            }
          }}
        >
          {isCollapsed ? (
            <ChevronRightIcon fontSize="small" />
          ) : (
            <ChevronLeftIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>

      {/* Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.paper",
            boxSizing: "border-box"
          }
        }}
      >
        {renderDrawerContent({ collapsed: false })}
      </Drawer>
    </>
  );
}
