const User = require('../models/User');

exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    res.json(user.cart);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const user = await User.findById(req.user.id);
    const itemIndex = user.cart.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      user.cart[itemIndex].quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }
    await user.save();
    const populatedUser = await User.findById(req.user.id).populate('cart.product');
    res.json(populatedUser.cart);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(item => item.product.toString() !== productId);
    await user.save();
    const populatedUser = await User.findById(req.user.id).populate('cart.product');
    res.json(populatedUser.cart);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
