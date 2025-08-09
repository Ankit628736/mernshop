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

    // Validate product prices and compute total
    let totalAmount = 0;
    for (const item of user.cart) {
      if (!item.product) continue;
      const rawPrice = item.product.price;
      const priceNum = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({ error: `Invalid price for product ${item.product._id}` });
      }
      totalAmount += priceNum * item.quantity;
    }

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
    const baseMsg = 'Failed to create payment intent.';
    // Always return diagnostic details (can remove later for security)
    res.status(500).json({
      error: baseMsg,
      details: {
        type: err.type,
        code: err.code,
        message: err.message
      }
    });
  }
};
