'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import ProductCard from './ProductCard';

const ProductList = ({ products, handleDelete, handleEdit }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Product Inventory
      </Typography>
      
      <TextField
        placeholder="Search products..."
        variant="outlined"
        fullWidth
        sx={{ mb: 3, maxWidth: 400 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          sx: { borderRadius: '12px', background: 'rgba(255, 255, 255, 0.8)' }
        }}
      />

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
            <ProductCard 
              product={product} 
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductList;