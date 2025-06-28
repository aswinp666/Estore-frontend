// ProductCard.js
'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import GlassCard from './GlassCard';

const ProductCard = ({ product, onDelete, onEdit }) => {
  const defaultImageUrl = 'https://via.placeholder.com/200?text=No+Image'; // Placeholder image

  const renderProductOptions = (options) => {
    if (!options || Object.keys(options).length === 0) {
      return null;
    }

    return (
      <List dense sx={{ py: 0, mb: 1, maxHeight: 60, overflowY: 'auto' }}>
        {Object.entries(options).map(([optionName, values]) => (
          values && values.length > 0 && (
            <ListItem key={optionName} disablePadding sx={{ py: 0, minHeight: 20 }}>
              <ListItemText
                primary={
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {optionName}:
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {values.join(', ')}
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </ListItem>
          )
        ))}
      </List>
    );
  };

  return (
    <GlassCard>
      <CardMedia
        component="img"
        height="200"
        image={product.imageUrl || defaultImageUrl}
        alt={product.name}
        sx={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px', objectFit: 'cover' }}
      />
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1, pr: 1 }}>
            {product.name}
          </Typography>
          <Typography variant="subtitle1" fontWeight={600} color="primary">
            ₹{product.price}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {product.description.length > 70
            ? `${product.description.substring(0, 70)}...`
            : product.description}
        </Typography>

        {renderProductOptions(product.options)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
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
                mr: 1,
                borderColor: 'rgba(41, 98, 255, 0.5)',
                color: '#2962FF',
                '&:hover': {
                  borderColor: '#2962FF',
                  bgcolor: 'rgba(41, 98, 255, 0.05)',
                }
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
                boxShadow: 'none',
                background: 'linear-gradient(45deg, #FF5722 0%, #FF7043 100%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #E64A19 0%, #F4511E 100%)',
                }
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