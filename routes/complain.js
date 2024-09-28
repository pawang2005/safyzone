const express = require('express');
const router = express.Router();
const complainControllers = require('../controller/complain.js');
const { isLoggedIn } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../app.js");
const upload = multer({ storage });
const wrapAsync = require("../utils/wrapAsync.js");

router.get("/", (req, res) => {
    res.send("hi, I am root");
});

router.use((req, res, next) => {
    res.locals.currUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

router.route('/complaints')
    .get(wrapAsync(complainControllers.index))
    .post(isLoggedIn, upload.single('image'), wrapAsync(complainControllers.createComplaint));

router.get('/complaints/new', isLoggedIn, complainControllers.renderNewForm);

router.get('/heatmap', isLoggedIn, wrapAsync(complainControllers.renderHeatmap));

router.post('/api/rate-route', wrapAsync(complainControllers.rateRoute));

router.get('/trend', isLoggedIn, wrapAsync(complainControllers.renderTrend));

router.route('/complaints/:id')
    .get(isLoggedIn, wrapAsync(complainControllers.showComplaint));

router.post('/complaints/:id/support', wrapAsync(complainControllers.supportComplaint));

router.post("/complaints/:id/reviews", wrapAsync(complainControllers.createReview));

module.exports = router;