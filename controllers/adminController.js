const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(admin._id),
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          profileImage: admin.profileImage,
        },
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private
const getAdminProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');

    if (admin) {
      res.json({
        success: true,
        data: admin,
      });
    } else {
      res.status(404);
      throw new Error('Admin not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private
const updateAdminProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (admin) {
      admin.name = req.body.name || admin.name;
      
      if (req.body.profileImage !== undefined) {
        admin.profileImage = req.body.profileImage;
      }
      
      if (req.body.password) {
        if (!req.body.currentPassword) {
          res.status(400);
          throw new Error('Please provide your current password to set a new password');
        }
        const isMatch = await admin.matchPassword(req.body.currentPassword);
        if (!isMatch) {
          res.status(401);
          throw new Error('Current password is incorrect');
        }
        admin.password = req.body.password;
      }

      const updatedAdmin = await admin.save();

      res.json({
        success: true,
        token: generateToken(updatedAdmin._id),
        admin: {
          _id: updatedAdmin._id,
          name: updatedAdmin.name,
          email: updatedAdmin.email,
          role: updatedAdmin.role,
          profileImage: updatedAdmin.profileImage,
        },
      });
    } else {
      res.status(404);
      throw new Error('Admin not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
};
