const Order = require('../models/Order');
const User = require('../models/User');

// Create a new order after successful payment
exports.createOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    if (!user || user.cart.length === 0) {
      return res.status(400).json({ error: 'Cannot create order from an empty cart.' });
    }

    const totalAmount = user.cart.reduce((acc, item) => {
      return acc + (item.product.price * item.quantity);
    }, 0);

    const newOrder = new Order({
      user: req.user.id,
      products: user.cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      })),
      total: totalAmount
    });

    await newOrder.save();

    // Add order to user's history and clear their cart
    user.orderHistory.push(newOrder._id);
    user.cart = [];
    await user.save();

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order.' });
  }
};

// Get order history for the logged-in user
exports.getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('products.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order history.' });
  }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email') // Populate user info
            .populate('products.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch all orders.' });
    }
};
