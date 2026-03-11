import { createTheme, responsiveFontSizes } from "@mui/material/styles";

let theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
      contrastText: "#ffffff"
    },

    secondary: {
      main: "#9c27b0",
      light: "#ba68c8",
      dark: "#7b1fa2",
      contrastText: "#ffffff"
    },

    error: {
      main: "#d32f2f"
    },

    warning: {
      main: "#ed6c02"
    },

    info: {
      main: "#0288d1"
    },

    success: {
      main: "#2e7d32"
    },

    background: {
      default: "#f5f5f5",
      paper: "#ffffff"
    }
  },

  typography: {
    fontFamily: ["Inter", "Roboto", "Helvetica", "Arial", "sans-serif"].join(","),

    h1: {
      fontWeight: 700,
      fontSize: "2.5rem"
    },

    h2: {
      fontWeight: 600,
      fontSize: "2rem"
    },

    h3: {
      fontWeight: 600,
      fontSize: "1.75rem"
    },

    h4: {
      fontWeight: 600,
      fontSize: "1.5rem"
    },

    button: {
      textTransform: "none",
      fontWeight: 600
    }
  },

  shape: {
    borderRadius: 10
  },

  spacing: 8,

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 16px"
        }
      }
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }
      }
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          borderBottom: "1px solid #e0e0e0"
        }
      }
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        fullWidth: true
      }
    }
  }
});

theme = responsiveFontSizes(theme);

export { theme };
