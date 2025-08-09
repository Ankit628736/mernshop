const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');

// Make sure updateProduct is imported here
const { 
  getProducts, 
  addProduct, 
  deleteProduct, 
  updateProduct,
  getProductById,
} = require('../controllers/productController');

// Public route
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-only routes
router.post('/', auth, isAdmin, addProduct);
router.put('/:id', auth, isAdmin, updateProduct); // <-- THIS LINE IS CRUCIAL
router.delete('/:id', auth, isAdmin, deleteProduct);

module.exports = router;
