const User = require('../models/userModel');
const Role = require('../models/roleModel');
const path = require('path');
const fs = require('fs');

const defaultImage = {
    filename: 'default-image.jpg',
    contentType: 'image/png'
};

// Helper function to generate image URLs
const generateImageURL = (req, filename) => {
    return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

//to Create user 
const register = async (req, res, next) => {
    try {
        const role = await Role.findOne({ role: 'User' });

        if (!role) {
            return next(createError(400, "Role not found"));
        }

        const { name, email, password, mobileNumber, gender } = req.body;

        // Check if file is uploaded
        let images = [];

        if (!req.files || req.files.length === 0) {
            images = [defaultImage];
        } else {
            images = req.files.map(file => {
                const filename = Date.now() + path.extname(file.originalname);
                const filepath = path.join(__dirname, '../uploads', filename);

                fs.writeFileSync(filepath, file.buffer); // Save the file to the filesystem

                return {
                    filename,
                    contentType: file.mimetype
                };
            });
        }

        // Create new user with the role Assigned 
        const newUser = new User({ name, email, password, mobileNumber, gender, images, roles: [role._id] });
        const savedUser = await newUser.save();
        
        return next(createSuccess(200, "User Registered Successfully", savedUser));
    }
    catch (error) {
        console.error(error);
        return next(createError(500, "Something went wrong"));
    }
};

// get all users
const getAllUsers = async (req, res, next) => {
    try {
        const allUsers = await User.find();

        const usersWithImageURLs = allUsers.map(user => {
            const imagesWithURLs = user.images.map(image => {
                return {
                    ...image._doc,
                    url: generateImageURL(req, image.filename)
                };
            });

            return {
                ...user._doc,
                images: imagesWithURLs
            };
        });

        return next(createSuccess(200, "All Users", usersWithImageURLs));
    } catch (error) {
        return next(createError(500, "Internal Server Error!"));
    }
};

// get user by id
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return next(createError(404, "User Not Found"));
        }

        const imagesWithURLs = user.images.map(image => {
            return {
                ...image._doc,
                url: generateImageURL(req, image.filename)
            };
        });

        const userWithImageURLs = {
            ...user._doc,
            images: imagesWithURLs
        };

        return next(createSuccess(200, "User found", userWithImageURLs));
    } catch (error) {
        console.error(error);
        return next(createError(500, "Internal Server Error!"));
    }
};

//update user
const updateUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { name, email, password, mobileNumber, gender } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return next(createError(404, "User Not Found"));
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password;
        if (mobileNumber) user.mobileNumber = mobileNumber;
        if (gender) user.gender = gender;

        if (req.files && req.files.length > 0) {
            const images = req.files.map(file => {
                const filename = Date.now() + path.extname(file.originalname);
                const filepath = path.join(__dirname, '../uploads', filename);

                fs.writeFileSync(filepath, file.buffer); // Save the file to the filesystem

                return {
                    filename,
                    contentType: file.mimetype
                };
            });

            user.images = images;
        }

        await user.save();
        return next(createSuccess(200, "User Details Updated successfully", user));
    } catch (error) {
        return next(createError(500, "Internal Server Error!"));
    }
};

// Delete User By Id
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return next(createError(404, "User Not Found"));
        }
        return next(createSuccess(200, "User Deleted successfully", user));
    } catch (error) {
        return next(createError(500, "Internal Server Error"))
    }
};

// images
const getImage = (req, res) => {
    const filepath = path.join(__dirname, '../uploads', req.params.filename);
    fs.readFile(filepath, (err, data) => {
        if (err) {
            return res.status(404).json({ message: 'Image not found' });
        }
        const mimeType = req.params.filename.split('.').pop();
        res.setHeader('Content-Type', `image/${mimeType}`);
        res.send(data);
    });
};


module.exports = { register, getAllUsers, getUserById, updateUser, deleteUser, getImage };