"use client";

import { useToast } from "@/components/ui";
import { logoutUser } from "@/helpers/common.helpers";
import {
  Box,
  CircularProgress,
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

import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import PersonIcon from "@mui/icons-material/Person";
import SubscriptionsOutlinedIcon from "@mui/icons-material/SubscriptionsOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState, type ReactNode } from "react";

import type { NavIconKey } from "@/lib/rbac";
import { getNavItemsForRole, normalizeRole } from "@/lib/rbac";
import { readAuthClientSession } from "@/services/auth/authSession.client";

const drawerWidth = 240;

const NAV_ICONS: Record<NavIconKey, ReactNode> = {
  dashboard: <DashboardIcon />,
  subscriptionPlans: <LayersOutlinedIcon />,
  subscriptions: <SubscriptionsOutlinedIcon />,
  companies: <BusinessOutlinedIcon />,
  superAdmins: <VerifiedUserOutlinedIcon />,
  reports: <AssessmentOutlinedIcon />,
  admins: <AdminPanelSettingsOutlinedIcon />,
  staff: <SupportAgentOutlinedIcon />,
  payments: <PaymentsOutlinedIcon />,
  groups: <GroupsOutlinedIcon />,
  customers: <PeopleOutlineIcon />,
  templates: <ArticleOutlinedIcon />,
  chats: <ChatOutlinedIcon />,
  campaigns: <CampaignOutlinedIcon />,
  workflows: <AccountTreeOutlinedIcon />
};

type NavLink = { text: string; icon: ReactNode; href: string };

function buildSidebarLinks(): NavLink[] {
  const role = normalizeRole(readAuthClientSession()?.user);
  const core: NavLink[] = [{ text: "Profile", icon: <PersonIcon />, href: "/profile" }];
  const scoped = getNavItemsForRole(role).map((item) => ({
    text: item.label,
    icon: NAV_ICONS[item.icon],
    href: item.path
  }));
  return [...core, ...scoped];
}

function isNavSelected(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
  const toast = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logoutUser();
    } catch {
      setIsLoggingOut(false);
      toast.showToast({
        message: "Could not log out right now. Please try again.",
        severity: "error"
      });
    }
  }, [isLoggingOut, toast]);

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
        {buildSidebarLinks().map((item) => (
          <Tooltip key={item.href} title={collapsed ? item.text : ""} placement="right">
            <ListItemButton
              component={Link}
              href={item.href}
              onClick={onClose}
              selected={isNavSelected(pathname, item.href)}
              sx={{
                minHeight: 46,
                px: 1.5,
                justifyContent: "flex-start",
                color: "text.secondary",
                "&.Mui-selected": {
                  bgcolor: "common.white",
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
            onClick={handleLogout}
            disabled={isLoggingOut}
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
              {isLoggingOut ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <LogoutRoundedIcon />
              )}
            </ListItemIcon>

            <ListItemText
              primary={isLoggingOut ? "Logging out..." : "Logout"}
              sx={getItemLabelStyles(collapsed)}
            />
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            position: "relative",
            width: desktopWidth,
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.default",
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

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.default",
            boxSizing: "border-box"
          }
        }}
      >
        {renderDrawerContent({ collapsed: false })}
      </Drawer>
    </>
  );
}
