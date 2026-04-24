import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    chat: {
      rail: string;
      railTint: string;
      pane: string;
      paneHighlight: string;
      inbound: string;
      inboundBorder: string;
      outbound: string;
      outboundText: string;
      bubbleMeta: string;
      chrome: string;
    };
  }
  interface PaletteOptions {
    chat?: Partial<Palette["chat"]>;
  }
}

export {};
