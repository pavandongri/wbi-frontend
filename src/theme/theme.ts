import { createTheme, responsiveFontSizes } from "@mui/material/styles";

let theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#00A884",
      light: "#26C8A2",
      dark: "#007E66",
      contrastText: "#ffffff"
    },

    secondary: {
      main: "#111B21",
      light: "#22313A",
      dark: "#0B141A",
      contrastText: "#F7F9FA"
    },

    error: {
      main: "#D93025"
    },

    warning: {
      main: "#F59E0B"
    },

    info: {
      main: "#0284C7"
    },

    success: {
      main: "#16A34A"
    },

    background: {
      default: "#EEF2F5",
      paper: "#FFFFFF"
    },

    text: {
      primary: "#111B21",
      secondary: "#5A6A74"
    },

    divider: "#D9E2E7",

    action: {
      hover: "rgba(17, 27, 33, 0.04)",
      selected: "rgba(0, 168, 132, 0.12)"
    }
  },

  typography: {
    fontFamily: ["Inter", "Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,

    h1: {
      fontWeight: 700,
      fontSize: "2.4rem",
      lineHeight: 1.2,
      letterSpacing: "-0.02em"
    },

    h2: {
      fontWeight: 700,
      fontSize: "1.95rem",
      lineHeight: 1.25
    },

    h3: {
      fontWeight: 600,
      fontSize: "1.65rem",
      lineHeight: 1.3
    },

    h4: {
      fontWeight: 600,
      fontSize: "1.35rem",
      lineHeight: 1.35
    },

    subtitle1: {
      fontWeight: 600
    },

    body1: {
      fontSize: "0.98rem",
      lineHeight: 1.6
    },

    body2: {
      color: "#5A6A74",
      lineHeight: 1.55
    },

    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "0.01em"
    }
  },

  shape: {
    borderRadius: 12
  },

  spacing: 8,

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#EEF2F5",
          color: "#111B21"
        }
      }
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          padding: "10px 18px",
          boxShadow: "none"
        },
        containedPrimary: {
          backgroundImage: "linear-gradient(135deg, #00A884 0%, #00BC8C 100%)",
          boxShadow: "0 8px 20px rgba(0, 168, 132, 0.26)"
        },
        containedSecondary: {
          boxShadow: "0 8px 18px rgba(17, 27, 33, 0.2)"
        }
      }
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: "1px solid #E5EDF1",
          boxShadow: "0 8px 30px rgba(9, 30, 66, 0.08)"
        }
      }
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          color: "#111B21",
          backgroundColor: "rgba(255, 255, 255, 0.86)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 1px 0 rgba(17, 27, 33, 0.08)"
        }
      }
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none"
        },
        rounded: {
          borderRadius: 16
        }
      }
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#CFDCE3"
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#B5C6CF"
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00A884",
            borderWidth: 2
          }
        }
      }
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: "2px 6px"
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
