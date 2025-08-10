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
    <div className="bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center text-white py-32 px-6 md:px-10"
        style={{
          backgroundImage: "url('/image/istockphoto-2185827880-612x612.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/20"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight drop-shadow-xl">
            Fresh Fruits Delivered to You
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-100 drop-shadow-lg">
            The best quality fruits, hand-picked and delivered fresh from the farm.
          </p>
          <Link
            to="/products"
            className="bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold py-3 px-10 rounded-full text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            🍓 Shop All Products
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14 text-gray-800">
          Our Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {featuredProducts.map((prod) => (
            <Link
              to={`/products/${prod._id}`}
              key={prod._id}
              className="group block transform transition duration-300 hover:scale-105"
            >
              <div className="bg-white border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 flex flex-col h-full">
                <div className="relative overflow-hidden">
                  <img
                    src={prod.image || 'https://via.placeholder.com/300'}
                    alt={prod.name}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
                </div>
                <div className="flex-grow p-5 flex flex-col">
                  <h3 className="text-lg font-semibold mb-1 text-gray-800 group-hover:text-green-600 transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-gray-500 text-sm flex-grow">{prod.description}</p>
                  <div className="mt-4">
                    <p className="text-xl font-bold text-green-700">
                      ₹{prod.price.toFixed(2)}
                    </p>
                    <button
                      onClick={(e) => handleAddToCart(e, prod._id)}
                      className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-full font-medium transition-all shadow-md hover:shadow-lg"
                    >
                      Add to Cart
                    </button>
                  </div>
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
