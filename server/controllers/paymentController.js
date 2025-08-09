const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.warn('[PAYMENT] STRIPE_SECRET_KEY is not set. Payment intent creation will fail.');
}
if (stripeSecret && stripeSecret.startsWith('pk_')) {
  console.error('[PAYMENT] STRIPE_SECRET_KEY is a publishable (pk_) key. You must use a secret (sk_) key from Stripe dashboard.');
}
const stripe = require('stripe')(stripeSecret && stripeSecret.startsWith('sk_') ? stripeSecret : '');
const User = require('../models/User');

exports.createPaymentIntent = async (req, res) => {
  try {
    if (!stripeSecret) {
      return res.status(500).json({ error: 'Payment service not configured (missing STRIPE_SECRET_KEY).' });
    }
    if (stripeSecret.startsWith('pk_')) {
      return res.status(500).json({ error: 'Server misconfiguration: STRIPE_SECRET_KEY is a publishable key (pk_...). Use a secret key (sk_...).' });
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

    // Basic minimum amount pre-check (Stripe often enforces >= 50 for many currencies like usd, inr)
    const minAmount = 50; // cents
    if (amountInCents < minAmount) {
      return res.status(400).json({ error: `Order total too low (need at least ${(minAmount/100).toFixed(2)} ${currency.toUpperCase()}).` });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata: { userId: req.user.id, cartItems: user.cart.length }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('[PAYMENT] Stripe/Error:', err);
    const combined = err && err.message ? `Failed to create payment intent: ${err.message}` : 'Failed to create payment intent.';
    res.status(500).json({
      error: combined,
      details: {
        type: err.type,
        code: err.code,
        message: err.message
      }
    });
  }
};
