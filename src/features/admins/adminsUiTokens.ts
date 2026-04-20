/** Align with theme `MuiOutlinedInput` (rounded rects, not pills). */
export const ADMINS_CONTROL_RADIUS_PX = 12;

/** Visual height to align primary button with `TextField` size="small" / default. */
export const ADMINS_CONTROL_HEIGHT_PX = 40;

/** Modal footer actions: same radius/height as “New admin” toolbar button. */
export const ADMINS_MODAL_ACTION_BUTTON_SX = {
  height: ADMINS_CONTROL_HEIGHT_PX,
  minHeight: ADMINS_CONTROL_HEIGHT_PX,
  px: 2.25,
  borderRadius: `${ADMINS_CONTROL_RADIUS_PX}px`,
  boxShadow: "none"
} as const;
