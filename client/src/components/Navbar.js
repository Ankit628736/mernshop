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
    <nav className="bg-gray-800 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-wider">Fruitify</Link>
        <div className="flex items-center space-x-6">
          <Link to="/products" className="hover:text-gray-300 transition-colors">Products</Link>
          {user ? (
            <>
              {user.isAdmin && <Link to="/admin" className="hover:text-gray-300 transition-colors">Admin</Link>}
              <Link to="/history" className="hover:text-gray-300">Order History</Link>
              <Link to="/cart" className="relative hover:text-gray-300 transition-colors">
                Cart
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition-colors">Logout</button>
              <span className="font-semibold hidden sm:block">Hi, {user.name}</span>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300 transition-colors">Login</Link>
              <Link to="/signup" className="hover:text-gray-300 transition-colors">Signup</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// Make sure this line is at the bottom of the file!
export default Navbar;
