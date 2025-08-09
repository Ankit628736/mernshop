const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createPaymentIntent } = require('../controllers/paymentController');

router.post('/create-payment-intent', auth, createPaymentIntent);

module.exports = router;
