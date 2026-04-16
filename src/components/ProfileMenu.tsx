"use client";

import { logoutUser } from "@/helpers/common.helpers";
import { Avatar, Divider, IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

export default function ProfileMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Avatar />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem component="a" href="/profile" onClick={handleClose}>
          Profile
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            handleClose();
            logoutUser();
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
