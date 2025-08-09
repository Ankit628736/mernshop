const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String, // URL to the image
  stock: Number
});
module.exports = mongoose.model('Product', productSchema);
