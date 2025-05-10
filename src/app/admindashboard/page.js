'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import AdminSidebar from './AdminSidebar';
import AdminAppBar from './AdminAppBar';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import Typography from '@mui/material/Typography';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    } else {
      setFilteredProducts(products);
    }
  }, [selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://estore-backend-dyl3.onrender.com/api/products');
      setProducts(response.data);
      setFilteredProducts(response.data); // Initialize filtered products with all products
    } catch (err) {
      console.error('Error fetching products:', err);
      alert('Failed to load products');
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setProduct(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('price', product.price);
    formData.append('category', product.category);
    if (product.image) formData.append('image', product.image);

    try {
      if (isEditing) {
        await axios.put(`https://estore-backend-dyl3.onrender.com/api/products/${currentProductId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('https://estore-backend-dyl3.onrender.com/api/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      await fetchProducts();
      resetForm();
      alert(`Product ${isEditing ? 'updated' : 'added'} successfully!`);
    } catch (err) {
      console.error('Error:', err);
      alert(`Failed to ${isEditing ? 'update' : 'add'} product`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://estore-backend-dyl3.onrender.com/api/products/${id}`);
      await fetchProducts();
      alert('Product deleted successfully!');
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: null // Reset image to allow new upload
    });
    setCurrentProductId(product._id);
    setIsEditing(true);
  };

  const resetForm = () => {
    setProduct({
      name: '',
      description: '',
      price: '',
      category: '',
      image: null
    });
    setIsEditing(false);
    setCurrentProductId(null);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <CssBaseline />
      <AdminAppBar />
      <AdminSidebar onCategorySelect={handleCategorySelect} />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - 280px)` }, pt: { xs: 8, sm: 3 } }}>
        <Toolbar />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {selectedCategory ? `${selectedCategory} Products` : 'All Products'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {selectedCategory 
              ? `Showing ${filteredProducts.length} products in ${selectedCategory} category`
              : `Showing all ${filteredProducts.length} products`}
          </Typography>
        </Box>

        <ProductForm 
          product={product}
          handleChange={handleChange}
          handleImageChange={handleImageChange}
          handleSubmit={handleSubmit}
          isEditing={isEditing}
        />

        <ProductList 
          products={filteredProducts}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
        />
      </Box>
    </Box>
  );
};

export default AdminDashboard;