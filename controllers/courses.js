const Course = require(`../models/Course`);
const Bootcamp = require(`../models/Bootcamps`);
const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);

// @desc Getcourses
//@route GET /api/v1/courses
//@route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asynchandler(async(req, res, next) => {
    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses,
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});

// @desc Get single course
//@route GET /api/v1/courses/:id
// @access Public
exports.getCourse = asynchandler(async(req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description',
    });

    if (!course) {
        return next(
            new ErrorResponse(`No course witht the id of ${req.params.id}`),
            404
        );
    }
    res.status(200).json({
        success: true,
        count: course.length,
        data: course,
    });
});

// @desc Add course
//@route GET /api/v1/bootcamps/:bootcampId/courses
// @access Private
exports.addCourse = asynchandler(async(req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`No bootcamp witht the id of ${req.params.bootcampId}`),
            404
        );
    }
    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
                401
            )
        );
    }

    const course = await Course.create(req.body);
    res.status(200).json({
        success: true,
        count: course.length,
        data: course,
    });
});

// @desc Update course
//@route PUT /api/v1/courses/:id
// @access Private
exports.updateCourse = asynchandler(async(req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (!course) {
        return next(
            new ErrorResponse(`No course witht the id of ${req.params.bootcampId}`),
            404
        );
    }
    // Make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update course ${course._id}`,
                401
            )
        );
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        success: true,
        data: course,
    });
});

// @desc Delete course
//@route Delete /api/v1/courses/:id
// @access Private
exports.deleteCourse = asynchandler(async(req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(
            new ErrorResponse(`No course witht the id of ${req.params.bootcampId}`),
            404
        );
    }
    // Make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to delete course ${course._id}`,
                401
            )
        );
    }

    await course.remove();
    res.status(200).json({
        success: true,
        data: {},
    });
});