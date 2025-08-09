const Product = require('../models/Product');

// Public: Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Admin: Add a new product
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, image, stock } = req.body;
    const newProduct = new Product({ name, description, price, image, stock });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) { res.status(500).json({ error: err.message }); }
};



// Admin: Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully." });
  } catch (err) { res.status(500).json({ error: err.message }); }
};


exports.updateProduct = async (req, res) => {
  // --- START OF DEBUGGING LOGS ---
  console.log('--- Received request to update product ---');
  console.log('Product ID from params:', req.params.id);
  console.log('Data from request body:', req.body);
  // --- END OF DEBUGGING LOGS ---

  try {
    const { name, description, price, image, stock } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, image, stock },
      // Add `runValidators` to ensure the new data matches your schema
      { new: true, runValidators: true } 
    );

    if (!updatedProduct) {
      console.log(`Product with ID ${req.params.id} not found in the database.`);
      return res.status(404).json({ error: "Product not found." });
    }

    console.log('Product updated successfully in database:', updatedProduct);
    res.json(updatedProduct);
  } catch (err) {
    // This will log the full Mongoose or database error to your terminal
    console.error('--- ERROR DURING PRODUCT UPDATE ---', err); 
    res.status(500).json({ error: 'An internal server error occurred.', details: err.message });
  }
};


exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching product." });
  }
};
