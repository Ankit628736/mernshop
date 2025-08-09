const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.warn('[PAYMENT] STRIPE_SECRET_KEY is not set. Payment intent creation will fail.');
}
const stripe = require('stripe')(stripeSecret || '');
const User = require('../models/User');

exports.createPaymentIntent = async (req, res) => {
  try {
    if (!stripeSecret) {
      return res.status(500).json({ error: 'Payment service not configured.' });
    }
    const user = await User.findById(req.user.id).populate('cart.product');
    if (!user) {
      return res.status(401).json({ error: 'User not found or unauthorized.' });
    }
    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty.' });
    }

    const totalAmount = user.cart.reduce((acc, item) => {
      if (!item.product) return acc; // safety
      return acc + (item.product.price * item.quantity);
    }, 0);

    if (totalAmount <= 0) {
      return res.status(400).json({ error: 'Cart total must be greater than zero.' });
    }

    const amountInCents = Math.round(totalAmount * 100);
    const currency = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();
    console.log(`[PAYMENT] Creating intent user=${user._id} amount=${amountInCents} currency=${currency}`);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata: { userId: req.user.id, cartItems: user.cart.length }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('[PAYMENT] Stripe/Error:', err);
    const prod = process.env.NODE_ENV === 'production';
    const debug = process.env.STRIPE_DEBUG === '1';
    const baseMsg = 'Failed to create payment intent.';
    if (!prod || debug) {
      return res.status(500).json({
        error: baseMsg,
        details: {
          type: err.type,
          code: err.code,
          message: err.message,
          raw: debug ? err : undefined
        }
      });
    }
    res.status(500).json({ error: baseMsg });
  }
};
