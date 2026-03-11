"use client";

import { logoutUser } from "@/helpers/common.helpers";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Avatar, Divider, IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

export default function ProfileMenu() {
  const { user } = useUser();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Avatar src={user?.picture || ""} />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem disabled>{user?.email}</MenuItem>

        <Divider />

        <MenuItem component="a" onClick={logoutUser}>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
