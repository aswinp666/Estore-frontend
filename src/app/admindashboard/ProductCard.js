'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  CardContent,
  CardMedia
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import  GlassCard  from './GlassCard';

const ProductCard = ({ product, onDelete, onEdit }) => {
  return (
    <GlassCard>
      <CardMedia
        component="img"
        height="200"
        image={product.imageUrl || '/placeholder-product.jpg'}
        alt={product.name}
        sx={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
      />
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            {product.name}
          </Typography>
          <Typography variant="subtitle1" fontWeight={600} color="primary">
            ${product.price}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {product.description.length > 100 
            ? `${product.description.substring(0, 100)}...` 
            : product.description}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Category: {product.category}
          </Typography>
          <Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => onEdit(product)}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                mr: 1
              }}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={() => onDelete(product._id)}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: 'none'
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </CardContent>
    </GlassCard>
  );
};

export default ProductCard;