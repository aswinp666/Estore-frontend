// theme.js (or theme.ts)
import { createTheme } from '@mui/material/styles';
import { blue, amber } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: blue[700],
    },
    secondary: {
      main: amber[500],
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
        fontWeight: 700,
    },
    h5: {
        fontWeight: 600,
    },
    h6: {
        fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          // background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        },
      },
    },
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: '8px', // Consistent button border radius
                textTransform: 'none', // Prevent uppercase text
            },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: '16px', // Consistent card border radius
            },
        },
    },
    MuiTextField: {
        defaultProps: {
            variant: 'outlined', // Default to outlined text fields
            fullWidth: true, // Default to full width text fields
        },
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    borderRadius: '12px', // Match GlassCard and other components
                },
            },
        },
    },
    // You can add more component overrides here for global styles
  },
});

export default theme;