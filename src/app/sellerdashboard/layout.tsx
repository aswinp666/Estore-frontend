// src/app/seller-dashboard/layout.tsx
'use client'; // This layout must be a client component because it uses useState

import * as React from 'react';
import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import SellerAppBar from './SellerAppBar'; // Import the new SellerAppBar
import SellerSidebar from './SellerSidebar'; // Import the new SellerSidebar

const drawerWidth = 280; // Define drawerWidth for consistent use

// REMOVE THIS BLOCK:
// export const metadata = {
//   title: 'Seller Dashboard',
//   description: 'Manage your products, orders, and sales as a seller.',
// };

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // New state to help with drawer transitions

  // Handles the start of the drawer closing transition
  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  // Handles the end of the drawer closing transition
  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    // Only toggle if the drawer isn't currently in the process of closing
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  return (
    <html lang="en">
      <body>
        {/* AppRouterCacheProvider and ThemeProvider are typically in the root layout (src/app/layout.tsx) */}
        {/* If they are needed specifically for this route group, keep them. Otherwise, consider moving them to src/app/layout.tsx */}
        <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
          {/* Seller App Bar */}
          <SellerAppBar toggleDrawer={handleDrawerToggle} />

          {/* Seller Sidebar */}
          <SellerSidebar
            mobileOpen={mobileOpen}
            handleDrawerToggle={handleDrawerToggle}
            // handleDrawerTransitionEnd={handleDrawerTransitionEnd} // Pass the new prop
          />

          {/* Main content area */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - ${drawerWidth}px)` }, // Use drawerWidth constant
              mt: { xs: 8, sm: 3 }, // Margin top to clear fixed app bar on small screens
            }}
          >
            <Toolbar sx={{ display: { xs: 'block', sm: 'none' } }} /> {/* Spacer for mobile app bar */}
            {children}
          </Box>
        </Box>
      </body>
    </html>
  );
}