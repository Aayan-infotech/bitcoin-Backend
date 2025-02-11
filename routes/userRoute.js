const express = require("express");
const { register, getAllUsers, getUserById, updateUser, deleteUser, getImage } = require('../controllers/userController');
const { verifyAdmin, verifyUser } = require('../middleware/verifyToken');
const upload = require('../middleware/upload');
const router = express.Router();

// Route definitions
router.post('/register', upload.array('images', 1), verifyAdmin, register); 
router.get('/', verifyAdmin, getAllUsers);
router.get('/:id', verifyUser, getUserById);
router.put('/:id', upload.array('images', 1), verifyAdmin, updateUser); 
router.delete('/:id', verifyAdmin, deleteUser);
router.get('/image/:filename', getImage); 

module.exports = router;
