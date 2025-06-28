// Rename your existing AdminSidebar.js to SellerSidebar.js and update its content
// SellerSidebar.js
'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Collapse
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  AddBox as AddBoxIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  BarChart as BarChartIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import Toolbar from '@mui/material/Toolbar';
import Link from 'next/link';

const drawerWidth = 280;

const SELLER_NAV_ITEMS = [
  { name: 'Dashboard', icon: <DashboardIcon />, path: '/seller-dashboard' },
  {
    name: 'Products', icon: <InventoryIcon />,
    subItems: [
      { name: 'My Listings', icon: <InventoryIcon />, path: '/seller-dashboard/products/listings' },
      { name: 'Add New Product', icon: <AddBoxIcon />, path: '/seller-dashboard/products/add' },
      { name: 'Inventory', icon: <InventoryIcon />, path: '/seller-dashboard/products/inventory' },
    ]
  },
  { name: 'Orders', icon: <ReceiptIcon />, path: '/seller-dashboard/orders' },
  { name: 'Sales & Analytics', icon: <BarChartIcon />, path: '/seller-dashboard/analytics' },
  { name: 'Settings', icon: <SettingsIcon />, path: '/seller-dashboard/settings' },
];

const SellerSidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const [openSubMenu, setOpenSubMenu] = useState({});

  const handleSubMenuClick = (itemName) => {
    setOpenSubMenu(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const drawerContent = (
    <Box sx={{ bgcolor: '#2962FF', height: '100%', color: 'white' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Avatar sx={{ width: 60, height: 60, bgcolor: 'white', color: '#2962FF' }}>
          <DashboardIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h6" noWrap component="div" sx={{ ml: 2, fontWeight: 700 }}>
          Seller Panel
        </Typography>
      </Toolbar>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
      <List>
        {SELLER_NAV_ITEMS.map((item) => (
          item.subItems ? (
            <React.Fragment key={item.name}>
              <ListItemButton onClick={() => handleSubMenuClick(item.name)}>
                <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.name} />
                {openSubMenu[item.name] ? <ExpandMoreIcon /> : <ChevronRightIcon />}
              </ListItemButton>
              <Collapse in={openSubMenu[item.name]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <Link href={subItem.path} passHref key={subItem.name}>
                      <ListItemButton sx={{ pl: 4 }} component="a" onClick={handleDrawerToggle}>
                        <ListItemIcon sx={{ color: 'white' }}>{subItem.icon}</ListItemIcon>
                        <ListItemText primary={subItem.name} />
                      </ListItemButton>
                    </Link>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ) : (
            <Link href={item.path} passHref key={item.name}>
              <ListItem disablePadding>
                <ListItemButton component="a" onClick={handleDrawerToggle}>
                  <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </ListItem>
            </Link>
          )
        ))}
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 1 }} />
        {/* Placeholder for Logout button, actual logout logic in SellerAppBar */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => { /* Logout logic will be handled by App Bar or context */ }}>
            <ListItemIcon sx={{ color: 'white' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default SellerSidebar;