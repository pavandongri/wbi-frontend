/** Shared “glass” / premium surface tokens for UI primitives */
export const glassSurface = {
  panel: {
    borderRadius: 2,
    border: "1px solid rgba(17, 27, 33, 0.08)",
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    backdropFilter: "blur(18px) saturate(160%)",
    WebkitBackdropFilter: "blur(18px) saturate(160%)",
    boxShadow: "0 18px 50px rgba(9, 30, 66, 0.12), 0 1px 0 rgba(255, 255, 255, 0.65) inset"
  },
  overlay: {
    backgroundColor: "rgba(245, 247, 250, 0.55)",
    backdropFilter: "blur(22px) saturate(165%)",
    WebkitBackdropFilter: "blur(22px) saturate(165%)"
  },
  modalBackdrop: {
    backgroundColor: "rgba(17, 27, 33, 0.38)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)"
  }
} as const;
