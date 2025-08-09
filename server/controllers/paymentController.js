// Lazy Stripe initialization so a missing/invalid key does NOT crash unrelated routes
const User = require('../models/User');
let stripeInstance = null;
let stripeKeyStateLogged = false;

function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!stripeKeyStateLogged) {
    if (!secret) {
      console.warn('[PAYMENT] STRIPE_SECRET_KEY is not set. Payment endpoints will return configuration error.');
    } else if (secret.startsWith('pk_')) {
      console.error('[PAYMENT] STRIPE_SECRET_KEY is a publishable (pk_) key. Use a secret key (sk_...) from the Stripe Dashboard > Developers > API keys.');
    }
    stripeKeyStateLogged = true;
  }
  if (!secret || !secret.startsWith('sk_')) {
    return null; // Misconfigured – caller will handle
  }
  if (!stripeInstance) {
    const stripeLib = require('stripe');
    try {
      stripeInstance = stripeLib(secret);
    } catch (e) {
      console.error('[PAYMENT] Failed to initialize Stripe SDK:', e.message);
      return null;
    }
  }
  return stripeInstance;
}

exports.createPaymentIntent = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      const raw = process.env.STRIPE_SECRET_KEY;
      if (!raw) {
        return res.status(500).json({ error: 'Payment service not configured: set STRIPE_SECRET_KEY (starts with sk_) in server environment.' });
      }
      if (raw.startsWith('pk_')) {
        return res.status(500).json({ error: 'Server misconfiguration: STRIPE_SECRET_KEY is a publishable (pk_) key. Use the secret key (sk_...) from Stripe Dashboard.' });
      }
      return res.status(500).json({ error: 'Payment service unavailable due to Stripe initialization failure.' });
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
