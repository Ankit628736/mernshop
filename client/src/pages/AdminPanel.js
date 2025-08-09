import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

// An initial state object for the form to reset to
const initialFormState = { name: '', description: '', price: '', image: '', stock: '' };

function AdminPanel() {
    const { user } = useContext(UserContext);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [allOrders, setAllOrders] = useState([]); // State for all customer orders
    
    // State for the product form, used for both adding and editing
    const [formData, setFormData] = useState(initialFormState);
    // State to track if we are editing a product
    const [editingProduct, setEditingProduct] = useState(null);

    // Function to fetch all necessary data for the admin panel
    const fetchData = async () => {
        try {
            // Fetch all data in parallel for better performance
            const [usersRes, productsRes, ordersRes] = await Promise.all([
                axios.get('/api/admin/users'),
                axios.get('/api/products'),
                axios.get('/api/orders/all') // Fetches all orders
            ]);
            
            setUsers(usersRes.data);
            setProducts(productsRes.data);
            setAllOrders(ordersRes.data);
        } catch (err) {
            console.error("Failed to fetch admin data:", err);
        }
    };

    useEffect(() => {
        if (user?.isAdmin) {
            fetchData();
        }
    }, [user]);

    // Handles changes in the form fields
    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handles submitting the form for both adding and editing products
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const method = editingProduct ? 'put' : 'post';
        const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
        
        try {
            await axios[method](url, formData);
            setFormData(initialFormState);
            setEditingProduct(null);
            fetchData();
        } catch (err) {
            console.error("Failed to submit product form:", err);
            alert("Operation failed. Check console for details.");
        }
    };

    // Sets the component into "edit mode"
    const handleEditClick = (product) => {
        setEditingProduct(product);
        setFormData(product);
    };

    // Cancels editing and clears the form
    const handleCancelEdit = () => {
        setEditingProduct(null);
        setFormData(initialFormState);
    };
    
    // Deletes a user after confirmation
    const deleteUser = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`/api/admin/users/${id}`);
                fetchData();
            } catch (err) {
                console.error("Failed to delete user:", err);
            }
        }
    };

    // Deletes a product after confirmation
    const deleteProduct = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(`/api/products/Rs.{id}`);
                fetchData();
            } catch (err) {
                console.error("Failed to delete product:", err);
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold my-6 text-center">Admin Dashboard</h1>
            
            {/* Manage Products Section */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <input name="name" value={formData.name} onChange={handleFormChange} placeholder="Product Name" className="p-2 border rounded" required />
                    <input name="price" value={formData.price} onChange={handleFormChange} placeholder="Price" type="number" step="0.01" className="p-2 border rounded" required />
                    <input name="stock" value={formData.stock} onChange={handleFormChange} placeholder="Stock" type="number" className="p-2 border rounded" />
                    <input name="image" value={formData.image} onChange={handleFormChange} placeholder="Image URL" className="p-2 border rounded" />
                    <textarea name="description" value={formData.description} onChange={handleFormChange} placeholder="Description" className="p-2 border rounded md:col-span-2"></textarea>
                    <div className="md:col-span-2 flex items-center gap-4">
                        <button type="submit" className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors">
                            {editingProduct ? 'Update Product' : 'Add Product'}
                        </button>
                        {editingProduct && (
                            <button type="button" onClick={handleCancelEdit} className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors">
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>

                <h3 className="text-xl font-semibold mt-8 mb-2">Product List</h3>
                <div className="max-h-64 overflow-y-auto">
                  {products.map(p => (
                      <div key={p._id} className="flex justify-between items-center p-2 border-b hover:bg-gray-50">
                          <span>{p.name} - Rs.{p.price}</span>
                          <div className="flex gap-2">
                              <button onClick={() => handleEditClick(p)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">Edit</button>
                              <button onClick={() => deleteProduct(p._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Delete</button>
                          </div>
                      </div>
                  ))}
                </div>
            </div>

            {/* All Customer Orders Section */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">All Customer Orders</h2>
                 <div className="max-h-96 overflow-y-auto">
                  {allOrders.map(order => (
                      <div key={order._id} className="p-4 border-b last:border-b-0 hover:bg-gray-50">
                          <p><strong>Order ID:</strong> {order._id}</p>
                          <p><strong>User:</strong> {order.user?.name || 'N/A'} ({order.user?.email || 'N/A'})</p>
                          <p><strong>Total:</strong> Rs.{order.total.toFixed(2)}</p>
                          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                  ))}
                 </div>
            </div>

            {/* Manage Users Section */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Manage Users</h2>
                 <div className="max-h-64 overflow-y-auto">
                  {users.map(u => (
                      <div key={u._id} className="flex justify-between items-center p-2 border-b hover:bg-gray-50">
                          <span>{u.name} ({u.email})</span>
                          <button onClick={() => deleteUser(u._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Delete</button>
                      </div>
                  ))}
                 </div>
            </div>
        </div>
    );
}

export default AdminPanel;
