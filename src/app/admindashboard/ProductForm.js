'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import GlassCard from './GlassCard';

const categories = [
  'TV',
  'Mobile',
  'Consoles',
  'Earpods',
  'Tablets',
  'Offer Products',
  'Camera',
  'Groceries'
];

// Options per category for rendering inputs and hints
const categoryOptions = {
  TV: { Size: ['50 inch', '55 inch'] },
  Mobile: { Color: ['Red', 'Black', 'Silver', 'White'], RAM: ['8GB', '12GB'] },
  Consoles: { Edition: ['Digital Edition', 'Standard Edition'] },
  Earpods: { Color: ['Black', 'Silver', 'White'] },
  Tablets: { Color: ['Black', 'White'], RAM: ['8GB', '12GB'] }
};

const ProductForm = ({
  product,
  handleChange,
  handleImageChange,
  handleSubmit,
  isEditing = false
}) => {
  const [imagePreview, setImagePreview] = React.useState(null);
  
  // Store actual options as arrays (like before)
  const [options, setOptions] = React.useState(product.options || {});

  // NEW: Store option inputs as strings to allow typing commas freely
  const [optionStrings, setOptionStrings] = React.useState(() => {
    const initialStrings = {};
    Object.entries(product.options || {}).forEach(([key, arr]) => {
      initialStrings[key] = arr.join(', ');
    });
    return initialStrings;
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageChange(e);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update optionStrings state without splitting — allows free typing
  const handleOptionStringChange = (optionKey, value) => {
    setOptionStrings(prev => ({
      ...prev,
      [optionKey]: value,
    }));
  };

  // Sync optionStrings (comma-separated strings) into options arrays
  const syncOptionStringsToOptions = () => {
    const newOptions = {};
    Object.entries(optionStrings).forEach(([key, str]) => {
      newOptions[key] = str
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0);
    });
    setOptions(newOptions);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    syncOptionStringsToOptions(); // update options from strings before submit

    // Use the latest options after syncing
    const extendedProduct = { ...product, options };

    const formData = new FormData();

    formData.append('name', extendedProduct.name);
    formData.append('price', extendedProduct.price);
    formData.append('description', extendedProduct.description);
    formData.append('category', extendedProduct.category);
    if (extendedProduct.image instanceof File) {
      formData.append('image', extendedProduct.image);
    }
    formData.append('options', JSON.stringify(extendedProduct.options));

    handleSubmit(formData);
  };

  return (
    <GlassCard sx={{
      mb: 4,
      p: 4,
      backdropFilter: 'blur(16px)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
    }}>
      <Typography
        variant="h5"
        fontWeight={600}
        gutterBottom
        sx={{
          mb: 3,
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        {isEditing ? '✏️ Edit Product' : '+ Add New Product'}
      </Typography>

      <form onSubmit={onSubmit}>
        <Grid container spacing={3}>
          {/* Product Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Product Name"
              name="name"
              value={product.name}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              InputProps={{
                sx: {
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.95)'
                  }
                }
              }}
            />
          </Grid>

          {/* Price */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Price"
              name="price"
              type="number"
              value={product.price}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                sx: {
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.95)'
                  }
                }
              }}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              value={product.description}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={4}
              variant="outlined"
              InputProps={{
                sx: {
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.95)'
                  }
                }
              }}
            />
          </Grid>

          {/* Category */}
          <Grid item xs={12} sm={12}>
            <FormControl
              fullWidth
              required
              sx={{ minWidth: '220px' }}
            >
              <InputLabel
                id="category-label"
                sx={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  px: 1,
                  borderRadius: '4px',
                  ml: -0.5
                }}
              >
                Category
              </InputLabel>
              <Select
                labelId="category-label"
                id="category-select"
                name="category"
                value={product.category}
                label="Category"
                onChange={handleChange}
                sx={{
                  width: '100%',
                  minWidth: '300px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.95)'
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: '12px',
                      marginTop: '8px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                    }
                  }
                }}
              >
                {categories.map((category) => (
                  <MenuItem
                    key={category}
                    value={category}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(41, 98, 255, 0.08)'
                      }
                    }}
                  >
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Dynamic Options Inputs */}
          {product.category && categoryOptions[product.category] && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Options
              </Typography>

              {Object.entries(categoryOptions[product.category]).map(([optionKey, optionValues]) => (
                <TextField
                  key={optionKey}
                  label={`${optionKey} (comma separated)`}
                  value={optionStrings[optionKey] || ''}
                  onChange={(e) => handleOptionStringChange(optionKey, e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  helperText={`Available: ${optionValues.join(', ')}`}
                />
              ))}
            </Grid>
          )}

          {/* Image Upload */}
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              component="label"
              fullWidth
              startIcon={<CloudUploadIcon />}
              sx={{
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(45deg, #2962FF 0%, #2979FF 100%)',
                boxShadow: '0 4px 15px rgba(41, 98, 255, 0.2)',
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                '&:hover': {
                  background: 'linear-gradient(45deg, #2979FF 0%, #2962FF 100%)',
                  boxShadow: '0 6px 20px rgba(41, 98, 255, 0.4)'
                }
              }}
            >
              {product.image ? 'Change Image' : 'Upload Image'}
              <input
                hidden
                accept="image/*"
                type="file"
                name="image"
                onChange={handleImageUpload}
              />
            </Button>
            {imagePreview && (
              <Box
                component="img"
                src={imagePreview}
                alt="Preview"
                sx={{
                  mt: 2,
                  borderRadius: '12px',
                  maxWidth: '100%',
                  maxHeight: 200,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}
              />
            )}
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                borderRadius: '12px',
                background: 'linear-gradient(45deg, #2962FF 0%, #2979FF 100%)',
                boxShadow: '0 4px 15px rgba(41, 98, 255, 0.3)',
                fontWeight: 700,
                fontSize: '1rem',
                '&:hover': {
                  background: 'linear-gradient(45deg, #2979FF 0%, #2962FF 100%)',
                  boxShadow: '0 6px 20px rgba(41, 98, 255, 0.5)'
                }
              }}
            >
              {isEditing ? 'Save Changes' : 'Add Product'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </GlassCard>
  );
};

export default ProductForm;
