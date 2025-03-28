const express = require('express');
const router = express.Router();
const complainControllers = require('../controller/complain.js');
const { isLoggedIn } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const wrapAsync = require("../utils/wrapAsync.js");

router.get("/", (req, res) => {
    res.redirect('/complaints')
});

router.use((req, res, next) => {
    res.locals.currUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

router.route('/complaints')
    .get(wrapAsync(complainControllers.index))
    .post( upload.single('image'), wrapAsync(complainControllers.createComplaint));

router.get('/complaints/new',isLoggedIn, complainControllers.renderNewForm);

router.get('/heatmap',isLoggedIn, wrapAsync(complainControllers.renderHeatmap));

router.post('/api/rate-route',isLoggedIn, wrapAsync(complainControllers.rateRoute));

router.get('/trend', wrapAsync(complainControllers.renderTrend));

router.get('/complaints/:id',isLoggedIn,wrapAsync(complainControllers.showComplaint), isLoggedIn);

router.post('/complaints/:id/support',isLoggedIn, wrapAsync(complainControllers.supportComplaint));

router.post("/complaints/:id/reviews", isLoggedIn,wrapAsync(complainControllers.createReview));

module.exports = router;