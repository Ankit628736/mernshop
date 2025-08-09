const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

exports.createPaymentIntent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    if (!user || user.cart.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty.' });
    }

    const totalAmount = user.cart.reduce((acc, item) => {
      return acc + (item.product.price * item.quantity);
    }, 0);

    // Amount must be in the smallest currency unit (e.g., cents for USD)
    const amountInCents = Math.round(totalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd', // You can change this to your desired currency
      metadata: { userId: req.user.id }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe Error:', err);
    res.status(500).json({ error: 'Failed to create payment intent.' });
  }
};
