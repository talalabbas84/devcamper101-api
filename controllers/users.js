const User = require(`../models/User`);
const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);

// @desc Gett all users
//@route GET /api/v1/auth/users
// @access Private/Admin
exports.getUsers = asynchandler(async(req, res, next) => {
    console.log('idhar');
    res.status(200).json(res.advancedResults);
});

// @desc Gett single user
//@route GET /api/v1/auth/users/:id
// @access Private/Admin
exports.getUser = asynchandler(async(req, res, next) => {
    const user = await User.findById(req.params.id);
    res.status(200).json({ success: true, data: user });
});

// @desc Create user
//@route POST /api/v1/auth/users
// @access Private/Admin
exports.createUser = asynchandler(async(req, res, next) => {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
});

// @desc Update  user
//@route GET /api/v1/auth/users/:id
// @access Private/Admin
exports.updateUser = asynchandler(async(req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({ success: true, data: user });
});

// @desc Delete user
//@route DELETE /api/v1/auth/users/:id
// @access Private/Admin
exports.deleteUser = asynchandler(async(req, res, next) => {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
});