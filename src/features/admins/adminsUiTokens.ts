/** Align with theme `MuiOutlinedInput` (rounded rects, not pills). */
export const ADMINS_CONTROL_RADIUS_PX = 12;

/** Table body scrolls when row area would exceed this; shorter lists stay compact. */
export const ADMINS_TABLE_SCROLL_MAX_HEIGHT_PX = 480;

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
