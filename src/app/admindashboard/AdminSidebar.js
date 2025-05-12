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
  Devices as DevicesIcon,
  Tv as TvIcon,
  PhoneIphone as MobileIcon,
  SportsEsports as ConsolesIcon,
  Headphones as EarpodsIcon,
  Tablet as TabletsIcon,
  Watch as SmartWatchesIcon,
  CameraAlt as CameraIcon,
  Computer as PcAccessoriesIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import Toolbar from '@mui/material/Toolbar';
import Link from 'next/link';

const CATEGORIES = [
  { name: 'TV', icon: <TvIcon /> },
  { name: 'Mobile', icon: <MobileIcon /> },
  { name: 'Consoles', icon: <ConsolesIcon /> },
  { name: 'Earpods', icon: <EarpodsIcon /> },
  { name: 'Tablets', icon: <TabletsIcon /> },
  { name: 'OfferItems', icon: <SmartWatchesIcon /> },
  { name: 'Camera', icon: <CameraIcon /> },
  { name: 'Groceries', icon: <PcAccessoriesIcon /> }
];

const AdminSidebar = ({ mobileOpen, toggleDrawer, onCategorySelect }) => {
  const [openCategories, setOpenCategories] = useState(false);

  const toggleCategories = () => setOpenCategories(!openCategories);

  const handleCategoryClick = (category) => {
    onCategorySelect(category);
  };

  return (
    <Box
      component="nav"
      sx={{ width: { sm: 280 }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            background: 'rgba(41, 98, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            color: 'white',
          },
        }}
      >
        <Toolbar />
        <SidebarContent 
          openCategories={openCategories}
          toggleCategories={toggleCategories}
          onCategoryClick={handleCategoryClick}
        />
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            background: 'rgba(41, 98, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            borderRight: 'none'
          },
        }}
        open
      >
        <Toolbar />
        <SidebarContent 
          openCategories={openCategories}
          toggleCategories={toggleCategories}
          onCategoryClick={handleCategoryClick}
        />
      </Drawer>
    </Box>
  );
};

const SidebarContent = ({
  openCategories,
  toggleCategories,
  onCategoryClick
}) => {
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar alt="Admin User" src="/static/images/avatar/1.jpg" sx={{ width: 48, height: 48, mr: 2 }} />
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>Admin User</Typography>
          <Typography variant="caption">Super Admin</Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
      
      <List>
        <ListItem disablePadding>
          <ListItemButton selected>
            <ListItemIcon sx={{ color: 'white' }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton onClick={toggleCategories}>
            <ListItemIcon sx={{ color: 'white' }}>
              <DevicesIcon />
            </ListItemIcon>
            <ListItemText primary="Categories" />
            {openCategories ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </ListItemButton>
        </ListItem>
        <Collapse in={openCategories} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {CATEGORIES.map((category) => (
              <ListItemButton 
                key={category.name} 
                sx={{ pl: 4 }}
                onClick={() => onCategoryClick(category.name)}
              >
                <ListItemIcon sx={{ color: 'white' }}>
                  {category.icon}
                </ListItemIcon>
                <ListItemText primary={category.name} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
        
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ color: 'white' }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>


        
      <ListItem disablePadding>
  <Link href="/order-history" passHref>
    <ListItemButton
      component="a"
      sx={{
        textDecoration: 'none', // removes underline
        color: 'inherit' // keeps text color consistent
      }}
    >
      <ListItemIcon sx={{ color: 'white' }}>
        <SettingsIcon />
      </ListItemIcon>
      <ListItemText primary="Order History" />
    </ListItemButton>
  </Link>
</ListItem>


        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ color: 'white' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default AdminSidebar;