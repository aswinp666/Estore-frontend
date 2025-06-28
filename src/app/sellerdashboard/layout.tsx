// layout.tsx
import { Inter } from 'next/font/google'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme'; // Assuming you have a theme.js or theme.ts file for MUI custom theme
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar'; // Import Toolbar
import React from 'react';
import SellerAppBar from './SellerAppBar'; // Import the new SellerAppBar
import SellerSidebar from './SellerSidebar'; // Import the new SellerSidebar

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Seller Dashboard',
  description: 'Manage your products, orders, and sales as a seller.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline /> {/* Resets browser default styles */}
            <Box sx={{ display: 'flex' }}>
              {/* Seller App Bar */}
              <SellerAppBar toggleDrawer={handleDrawerToggle} />
              {/* Seller Sidebar */}
              <SellerSidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

              {/* Main content area */}
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  p: 3,
                  width: { sm: `calc(100% - 280px)` }, // Adjust based on sidebar width
                  mt: { xs: 8, sm: 3 } // Margin top to clear fixed app bar on small screens
                }}
              >
                <Toolbar sx={{ display: { xs: 'block', sm: 'none' } }} /> {/* Spacer for mobile app bar */}
                {children}
              </Box>
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}