import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { UserContext } from '../context/UserContext';

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        setFeaturedProducts(res.data.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
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
    <div>
      {/* Hero Section */}
      <section 
        className="relative bg-cover bg-center text-white py-32 px-10 object-fill" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1533681018244-5b1a83e959d9?q=80&w=2070')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">Fresh Fruits Delivered to You</h1>
          <p className="text-xl mb-8 drop-shadow-md">The best quality fruits, hand-picked and delivered fresh from the farm.</p>
          <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105">
            Shop All Products
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Our Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {featuredProducts.map(prod => (
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
      </section>
    </div>
  );
}

export default Home;
