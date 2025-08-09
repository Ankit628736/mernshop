import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      axios.get('/api/orders/history')
        .then(res => setOrders(res.data))
        .catch(err => console.error("Failed to fetch order history", err));
    }
  }, [user]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Order History</h1>
      {orders.length === 0 ? (
        <p>You have no past orders.</p>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <div>
                  <p className="font-semibold">Order ID: {order._id}</p>
                  <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-xl font-bold">Total: Rs.{order.total.toFixed(2)}</p>
              </div>
              <div>
                {order.products.map(({ product, quantity }) => (
                  <div key={product._id} className="flex items-center justify-between py-2">
                    <span>{product.name} x {quantity}</span>
                    <span>Rs.{(product.price * quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default OrderHistory;
