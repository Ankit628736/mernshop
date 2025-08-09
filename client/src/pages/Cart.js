import React, { useState, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm';

// Load your Stripe publishable key from environment variables
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function Cart() {
  const { cartItems, fetchCart, removeFromCart } = useContext(CartContext);
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const navigate = useNavigate();

  const total = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleCheckoutClick = async () => {
    try {
      const res = await axios.post('/api/payment/create-payment-intent');
      setClientSecret(res.data.clientSecret);
      setShowCheckout(true);
    } catch (err) {
      console.error("Failed to create payment intent", err);
      alert("Could not initiate checkout. Please try again.");
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
      try {
          await axios.post('/api/orders/create', { paymentIntent });
          alert('Payment successful and order created!');
          fetchCart(); // This will clear the cart on the backend and update the state
          setShowCheckout(false);
          navigate('/history'); // Redirect user to their order history
      } catch (err) {
          console.error('Failed to create order', err);
          alert('Payment was successful, but failed to create your order. Please contact support.');
      }
  };

  if (cartItems.length === 0 && !showCheckout) {
    return (
      <div className="container mx-auto p-4 text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <Link to="/products" className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      {!showCheckout ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* ================================================================== */}
          {/* == THIS IS THE SECTION THAT WAS MISSING AND HAS BEEN RESTORED == */}
          {cartItems.map(item => (
            <div key={item.product._id} className="flex flex-col sm:flex-row items-center justify-between border-b py-4">
              <div className="flex items-center mb-4 sm:mb-0">
                <img src={item.product.image || 'https://via.placeholder.com/100'} alt={item.product.name} className="w-24 h-24 object-cover mr-4 rounded"/>
                <div>
                  <h2 className="text-xl font-semibold">{item.product.name}</h2>
                  <p className="text-gray-600">${item.product.price.toFixed(2)} x {item.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
                <button
                  onClick={() => removeFromCart(item.product._id)}
                  className="text-red-500 hover:text-red-700 font-semibold text-sm mt-1"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {/* ================================================================== */}

          <div className="mt-6 text-right">
            <h2 className="text-2xl font-bold">Total: ${total.toFixed(2)}</h2>
            <button 
              onClick={handleCheckoutClick}
              className="mt-4 bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600">
              Proceed to Checkout
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Complete Your Payment</h2>
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} onPaymentSuccess={handlePaymentSuccess} />
            </Elements>
          )}
        </div>
      )}
    </div>
  );
}

export default Cart;
