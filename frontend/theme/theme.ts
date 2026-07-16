"use client";

import { createTheme } from "@mui/material/styles";
export const theme = createTheme(
    {
       palette: {
        primary:{
            main:"#1976d2",
        },
        background: {
            default: "#f5f5f5",
            paper: "#ffffff",
        },
       } ,
       shape: {
        borderRadius: 8,
       },
        typography: {
    fontFamily: "Arial, Helvetica, sans-serif",

    h4: {
      fontWeight: 700,
    },

    h5: {
      fontWeight: 700,
    },

    button: {
      fontWeight: 700,
    },
  },
  components:{
    MuiButton: {
        styleOverrides: {
            root: {
                minHeight: 48,
                borderRaduis: 8,
            },
        },
    },
    MuiTextField: {
        defaultProps: {
            variant: "outlined",
            fullWidth: true,
        },
    },
  },
    });