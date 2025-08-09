const express = require('express');
const router = express.Router(); // The router is created here
const { auth, isAdmin } = require('../middleware/auth');
const { createOrder, getOrderHistory, getAllOrders } = require('../controllers/orderController');

// Define the routes on the router
router.post('/create', auth, createOrder);
router.get('/history', auth, getOrderHistory);
router.get('/all', auth, isAdmin, getAllOrders); // Admin-only route

// THIS IS THE CRUCIAL LINE THAT FIXES THE ERROR
module.exports = router; // The router is exported here
