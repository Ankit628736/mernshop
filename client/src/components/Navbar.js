import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { CartContext } from '../context/CartContext';
import axios from 'axios';

function Navbar() {
  const { user, setUser } = useContext(UserContext);
  const { cartItems, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      localStorage.removeItem('authToken');
      clearCart();
      navigate('/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="bg-gradient-to-r from-green-600 to-lime-500 p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-3xl font-extrabold tracking-wider text-white drop-shadow-md hover:scale-105 transition-transform"
        >
          🍎 Fruitify
        </Link>

        {/* Links */}
        <div className="flex items-center space-x-6">
          <Link
            to="/products"
            className="text-white font-medium hover:text-yellow-200 transition-colors"
          >
            Products
          </Link>

          {user ? (
            <>
              {user.isAdmin && (
                <Link
                  to="/admin"
                  className="text-white font-medium hover:text-yellow-200 transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/history"
                className="text-white font-medium hover:text-yellow-200 transition-colors"
              >
                Order History
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative text-white font-medium hover:text-yellow-200 transition-colors"
              >
                🛒 Cart
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-4 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded-full text-white font-semibold hover:bg-red-600 shadow-md transition-transform hover:scale-105"
              >
                Logout
              </button>

              {/* Greeting */}
              <span className="font-semibold hidden sm:block text-white">
                Hi, <span className="text-yellow-200">{user.name}</span>
              </span>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-white text-green-700 px-4 py-1 rounded-full font-semibold hover:bg-yellow-100 shadow-md transition-transform hover:scale-105"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-yellow-300 text-green-800 px-4 py-1 rounded-full font-semibold hover:bg-yellow-400 shadow-md transition-transform hover:scale-105"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
