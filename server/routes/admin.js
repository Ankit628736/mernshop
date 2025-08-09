const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const { getUsers, deleteUser } = require('../controllers/adminController');

// Protect all routes in this file
router.use(auth, isAdmin);

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
