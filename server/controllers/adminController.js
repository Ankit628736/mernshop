const User = require('../models/User');

// Admin: Get all non-admin users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ isAdmin: false }).select('-password');
        res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Admin: Delete a user
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully." });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
