'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  CardActions,
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { addItemToCart } from '@/redux/features/cart-slice';

const ProductSearchModal = ({ open, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [sortOption, setSortOption] = useState('');
  const dispatch = useDispatch(); 

  const categories = [
    'All',
    'TV',
    'Mobile',
    'Consoles',
    'Earpods',
    'Tablets',
    'Offer Products',
    'Camera',
    'Groceries',
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('https://estore-backend-dyl3.onrender.com/api/products');
        const data = await res.json();
        console.log(data);  // Log the data to verify it
        setAllProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, allProducts, sortOption]);

  const filterProducts = () => {
    let filtered = allProducts;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by price
    if (sortOption === 'lowToHigh') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortOption === 'highToLow') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
  };

  // Custom Product Card with Fixed Size
  const ProductCard = ({ product }) => {
    const handleAddToCartClick = () => {
      dispatch(
        addItemToCart({
          _id: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl,
        })
      );
    };

    return (
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 3,
          height: '320px',
          width: '250px',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 240,
          // margin: 'auto',
        }}
      >
        <Box sx={{ 
          height: '140px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CardMedia
            component="img"
            image={product.imageUrl || '/placeholder.png'}
            alt={product.name}
            sx={{ 
              width: '100%',
              height: '100%',
              objectFit: 'scale-down',
              borderRadius: '12px 12px 0 0'
            }}
          />
        </Box>
        <CardContent sx={{ 
          padding: 2,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontSize: '1rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', mt: 'auto' }}>
            <span style={{marginLeft: 8 }}>
              ₹{product.price}
            </span>
          </Typography>
        </CardContent>
        <CardActions sx={{ padding: 2 }}>
          <Button 
            size="small" 
            variant="contained" 
            fullWidth
            onClick={handleAddToCartClick}
          >
            Add to Cart
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 3,
          width: '90%',
          maxWidth: '1200px',
          maxHeight: '80vh',
          overflowY: 'auto',
          p: 4,
        }}
      >
        {/* Modal Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            Search Products
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Search Bar and Sort Dropdown */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TextField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name"
            fullWidth
            variant="outlined"
            sx={{ marginRight: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Sort Dropdown */}
          <TextField
            select
            label=""
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            fullWidth
            SelectProps={{
              native: true,
            }}
            sx={{ width: '150px' }}
          >
            <option value="">Sort By</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
          </TextField>
        </Box>

        {/* Category Buttons */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            mb: 3,
          }}
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'contained' : 'outlined'}
              onClick={() => setSelectedCategory(category)}
              sx={{ textTransform: 'none' }}
            >
              {category}
            </Button>
          ))}
        </Box>

        {/* Products Grid */}
        <Grid container spacing={3} justifyContent="center">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <ProductCard product={product} />
              </Grid>
            ))
          ) : (
            <Typography variant="body1" sx={{ ml: 1 }}>
              No products found.
            </Typography>
          )}
        </Grid>
      </Box>
    </Modal>
  );
};

export default ProductSearchModal;