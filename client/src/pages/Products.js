import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { UserContext } from '../context/UserContext';
import { Link, useNavigate } from 'react-router-dom';

function Products() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Failed to fetch products:", err));
  }, []);

  const handleAddToCart = (e, productId) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      alert('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }
    addToCart(productId);
    alert('Product added to cart!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Our Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map(prod => (
          // THIS IS THE CORRECTED LINE - It uses the dynamic 'prod._id'
          <Link to={`/products/${prod._id}`} key={prod._id} className="group block">
            <div className="bg-white border rounded-lg p-4 flex flex-col shadow-lg group-hover:shadow-xl transition-shadow duration-300 h-full">
              <img src={prod.image || 'https://via.placeholder.com/300'} alt={prod.name} className="w-full h-56 object-cover rounded-t-lg mb-4"/>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{prod.name}</h3>
                <p className="text-gray-600 text-sm">{prod.description}</p>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-blue-600">Rs. {prod.price.toFixed(2)}</p>
                <button
                  onClick={(e) => handleAddToCart(e, prod._id)}
                  className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Products;
