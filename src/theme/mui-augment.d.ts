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
    auth: {
      alertErrorText: string;
      alertErrorBg: string;
      alertErrorBorder: string;
      alertErrorIcon: string;
    };
  }
  interface PaletteOptions {
    chat?: Partial<Palette["chat"]>;
    auth?: Partial<Palette["auth"]>;
  }
}

export {};
