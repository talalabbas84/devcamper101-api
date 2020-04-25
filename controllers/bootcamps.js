const path = require('path');

const Bootcamp = require(`../models/Bootcamps`);
const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);
const geocoder = require('../utils/geocoder');

// @desc Get all bootcamps
//@route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asynchandler(async(req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc Get single bootcamp
//@route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = asynchandler(async(req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }
    res.status(200).json({ success: true, data: bootcamp });
});

// @desc Create new bootcamp
//@route POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = asynchandler(async(req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);
    return res.status(201).json({
        success: true,
        data: bootcamp,
    });
});

// @desc Update bootcamp
//@route PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = asynchandler(async(req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }
    res.status(200).json({ success: true, data: bootcamp });
});

// @desc Delete  bootcamp
//@route DLETE /api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = asynchandler(async(req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }
    bootcamp.remove();
    res.status(200).json({ success: true, data: {} });
});

// @desc Get bootcamps within a radius
//@route DLETE /api/v1/bootcamps/radius/:zipcode/:distance
// @access Private
exports.getBootcampsinRadius = asynchandler(async(req, res, next) => {
    const { zipcode, distance } = req.params;

    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    //Calc radius
    // Divide dist by radius of Earth
    // Earth Radius = 3963 miles/ 6378 km
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [
                    [lng, lat], radius
                ],
            },
        },
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps,
    });
});

// @desc Upload photo for bootcamp
//@route PUT /api/v1/bootcamps/:id/photo
// @access Private
exports.bootcampPhotoUpload = asynchandler(async(req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }
    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }
    const file = req.files.file;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image image file`, 400));
    }
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(
                `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
                400
            )
        );
    }

    //Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async(err) => {
        if (err) {
            console.log(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
        return res.status(200).json({ success: true, data: file.name });
    });
});