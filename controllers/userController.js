const { User } = require('../models');

/**
 * Get all users
 * @route GET /api/users
 * @access Private/Admin
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      status: 'success',
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user role
 * @route PUT /api/users/:id/role
 * @access Private/Admin
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    // Check if user exists
    let user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({
        status: 'error',
        message: 'Role is required'
      });
    }

    // Update role
    user.role = role;
    await user.save();

    // Return updated user without password
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      status: 'success',
      message: 'User role updated successfully',
      data: updatedUser
    });
  } catch (err) {
    next(err);
  }
};