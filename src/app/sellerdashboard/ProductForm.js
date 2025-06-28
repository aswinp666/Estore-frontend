// ProductForm.js
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  FormGroup,
  Checkbox,
  FormControlLabel,
  IconButton,
  CardMedia,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  AddCircle as AddCircleIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import GlassCard from './GlassCard'; // Ensure GlassCard is accessible

// Categories from your backend Product.js model
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

// Options per category for rendering inputs and hints (matches Product.js options: Map of arrays)
const categoryOptionsConfig = {
  TV: { Size: [] },
  Mobile: { Color: [], RAM: [] },
  Consoles: { Edition: [] },
  Earpods: { Color: [] },
  Tablets: { Color: [], RAM: [] },
  'Offer Products': {}, // No specific options usually
  Camera: {},
  Groceries: {},
};

const ProductForm = ({ productToEdit, onProductSaved, API_BASE_URL }) => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null, // File object for new image, or URL string for existing image
    options: {}, // For dynamic options like { Color: ["Red", "Black"], RAM: ["8GB"] }
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isEditing = Boolean(productToEdit);

  useEffect(() => {
    if (productToEdit) {
      setProduct({
        name: productToEdit.name,
        description: productToEdit.description,
        price: productToEdit.price,
        category: productToEdit.category,
        image: productToEdit.imageUrl, // Set current image URL
        options: productToEdit.options || {},
      });
      setImagePreview(productToEdit.imageUrl);
    } else {
      // Reset form if not editing
      setProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        image: null,
        options: {},
      });
      setImagePreview(null);
    }
    setError(null); // Clear errors on product change
    setSuccess(null); // Clear success message
  }, [productToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));

    // Reset options when category changes
    if (name === 'category') {
      setProduct((prevProduct) => ({
        ...prevProduct,
        options: {}, // Clear previous options
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProduct((prevProduct) => ({
        ...prevProduct,
        image: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setProduct((prevProduct) => ({
        ...prevProduct,
        image: isEditing ? productToEdit.imageUrl : null, // Revert to old image or null
      }));
      setImagePreview(isEditing ? productToEdit.imageUrl : null);
    }
  };

  const handleOptionChange = (optionName, value, isChecked) => {
    setProduct((prevProduct) => {
      const currentOptions = { ...prevProduct.options };
      if (!currentOptions[optionName]) {
        currentOptions[optionName] = [];
      }

      if (isChecked) {
        // Add option value if checked and not already present
        if (!currentOptions[optionName].includes(value)) {
          currentOptions[optionName] = [...currentOptions[optionName], value];
        }
      } else {
        // Remove option value if unchecked
        currentOptions[optionName] = currentOptions[optionName].filter((item) => item !== value);
      }
      return { ...prevProduct, options: currentOptions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('price', product.price);
    formData.append('category', product.category);

    // Append image only if it's a new file, or if it's an existing product and the image was changed
    if (product.image && typeof product.image !== 'string') {
      formData.append('image', product.image);
    }
    // If editing and image is still a URL string, don't append it to formData for multer
    // Backend should handle `imageUrl` field directly if provided, or ignore if file is uploaded

    // Append options as a JSON string
    formData.append('options', JSON.stringify(product.options));

    // Get token (assuming it's stored in localStorage after login)
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please log in.');
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/products/${productToEdit._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccess('Product updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/products`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccess('Product added successfully!');
      }
      onProductSaved(); // Callback to refresh product list and navigate
    } catch (err) {
      console.error('Error saving product:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderOptionsFields = () => {
    const selectedCategoryOptions = categoryOptionsConfig[product.category] || {};
    const optionKeys = Object.keys(selectedCategoryOptions);

    if (optionKeys.length === 0) {
      return (
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary">
            No specific options for this category.
          </Typography>
        </Grid>
      );
    }

    return optionKeys.map((optionName) => (
      <Grid item xs={12} sm={6} key={optionName}>
        <FormControl component="fieldset" fullWidth margin="normal">
          <InputLabel component="legend" shrink sx={{ position: 'relative', transform: 'none', mb: 1 }}>
            {optionName} Options
          </InputLabel>
          <TextField
            name={optionName}
            label={`Enter comma-separated ${optionName} values (e.g., Red,Blue)`}
            variant="outlined"
            value={(product.options[optionName] || []).join(', ')}
            onChange={(e) => {
              const values = e.target.value.split(',').map(s => s.trim()).filter(s => s);
              setProduct(prev => ({
                ...prev,
                options: { ...prev.options, [optionName]: values }
              }));
            }}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              },
            }}
          />
        </FormControl>
      </Grid>
    ));
  };

  return (
    <GlassCard sx={{ p: 4, mt: 3, mb: 5 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        {isEditing ? 'Edit Product' : 'Add New Product'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Product Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Product Name"
              name="name"
              value={product.name}
              onChange={handleChange}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
          </Grid>
          {/* Product Price */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Price"
              name="price"
              type="number"
              value={product.price}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
          </Grid>
          {/* Product Category */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <TextField
                select // Use TextField with select prop for MenuItem
                label="Category"
                name="category"
                value={product.category}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
          </Grid>
          {/* Product Description */}
          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              value={product.description}
              onChange={handleChange}
              multiline
              rows={4}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
          </Grid>

          {/* Dynamic Product Options based on Category */}
          {product.category && renderOptionsFields()}

          {/* Product Image Upload */}
          <Grid item xs={12} sm={6}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="raised-button-file"
              multiple
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="raised-button-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{
                  height: '56px',
                  borderRadius: '12px',
                  border: '2px dashed rgba(41, 98, 255, 0.5)',
                  color: '#2962FF',
                  '&:hover': {
                    border: '2px dashed #2962FF',
                    bgcolor: 'rgba(41, 98, 255, 0.05)',
                  }
                }}
              >
                {imagePreview ? 'Change Image' : 'Upload Product Image'}
              </Button>
            </label>
            {imagePreview && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <CardMedia
                  component="img"
                  image={imagePreview}
                  alt="Product Preview"
                  sx={{ width: 100, height: 100, borderRadius: '8px', objectFit: 'cover' }}
                />
                <Typography variant="body2" color="text.secondary">
                  {typeof product.image === 'string' ? 'Current Image' : product.image?.name || 'New Image Selected'}
                </Typography>
                <IconButton onClick={() => {
                  setProduct(prev => ({ ...prev, image: null }));
                  setImagePreview(null);
                }} size="small" color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12} sm={6}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : (isEditing ? <AddCircleIcon /> : <AddCircleIcon />)}
              sx={{
                height: '56px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '1rem',
                background: 'linear-gradient(45deg, #2962FF 0%, #2979FF 100%)',
                boxShadow: '0 4px 15px rgba(41, 98, 255, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #2962FF 0%, #2979FF 100%)',
                  boxShadow: '0 6px 20px rgba(41, 98, 255, 0.6)',
                }
              }}
            >
              {isEditing ? 'Update Product' : 'Add Product'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </GlassCard>
  );
};

export default ProductForm;