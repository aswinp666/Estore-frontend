// ProductList.js
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Alert
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import ProductCard from './ProductCard'; // Ensure ProductCard is in the same directory
import GlassCard from './GlassCard'; // Ensure GlassCard is accessible

const ProductList = ({ products, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    // Filter products whenever the products prop or search term changes
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const result = products.filter(product =>
      product.name.toLowerCase().includes(lowercasedSearchTerm) ||
      product.description.toLowerCase().includes(lowercasedSearchTerm) ||
      product.category.toLowerCase().includes(lowercasedSearchTerm)
    );
    setFilteredProducts(result);
  }, [searchTerm, products]); // Depend on products and searchTerm

  return (
    <GlassCard sx={{ p: 4, mt: 3, mb: 5 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Product Listings
      </Typography>

      <TextField
        placeholder="Search products by name, description, or category..."
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          mb: 3,
          maxWidth: { xs: '100%', sm: '80%', md: '60%' },
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(5px)',
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
      />

      {filteredProducts.length === 0 && !searchTerm && (
        <Alert severity="info" sx={{ my: 2 }}>
          You don't have any products listed yet. Click "Add Product" to get started!
        </Alert>
      )}

      {filteredProducts.length === 0 && searchTerm && (
        <Alert severity="warning" sx={{ my: 2 }}>
          No products found matching "{searchTerm}". Please try a different search term.
        </Alert>
      )}

      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
            <ProductCard
              product={product}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          </Grid>
        ))}
      </Grid>
    </GlassCard>
  );
};

export default ProductList;