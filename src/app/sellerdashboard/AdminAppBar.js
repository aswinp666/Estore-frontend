'use client';

import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  Avatar, 
  Badge 
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

const AdminAppBar = ({ toggleDrawer }) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - 280px)` },
        ml: { sm: '280px' },
        background: 'rgba(41, 98, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        zIndex: 1200
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleDrawer}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            Admin Dashboard
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <EmailIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Avatar alt="Admin User" src="/static/images/avatar/1.jpg" sx={{ width: 36, height: 36 }} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminAppBar;