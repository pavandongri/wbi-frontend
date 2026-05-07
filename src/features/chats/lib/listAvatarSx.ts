import type { Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

/** Stable accent avatar from thread id — uses primary / info / success from the app theme. */
export function listAvatarSx(theme: Theme, seed: string): Record<string, string | number> {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const pairs: [string, string][] = [
    [theme.palette.primary.light, theme.palette.primary.main],
    [alpha(theme.palette.primary.main, 0.55), theme.palette.primary.dark],
    [alpha(theme.palette.info.main, 0.42), theme.palette.info.main],
    [alpha(theme.palette.success.main, 0.38), theme.palette.success.main]
  ];
  const [from, to] = pairs[h % pairs.length];
  return {
    background: `linear-gradient(145deg, ${from} 0%, ${to} 100%)`,
    color: theme.palette.primary.contrastText
  };
}
