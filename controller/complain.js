const Review = require("../models/review.js");
const complainModel = require("../models/complaint.js");
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const ejs = require('ejs');
const path = require('path');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL, 
      pass: process.env.PASSWORD,   
    }
});

const sendAcceptanceEmail = (userEmail, complain1, location1, category1) => {
    ejs.renderFile(path.join(__dirname, '..', 'views', 'emails', 'emailTemplate.ejs'), {
      complain: complain1,
      location: location1,
      category: category1
    }, (err, data) => {
      if (err) {
        console.log('Error rendering EJS:', err);
        return;
      }
  
      let mailOptions = {
        from: '"SafyZone" <your-email@gmail.com>',
        to: userEmail,
        subject: 'Incident Report!',
        html: data,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    });
};

module.exports.index = async (req, res) => {
    const complaints = await complainModel.find({});
    res.render('listings/index.ejs', { complaints, msg: req.flash("success") });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.createComplaint = async (req, res) => {
    try {
        const { complain, location, category } = req.body;
        const { path: url, filename } = req.file;
        
        const newComplaint = await complainModel.create({
            imageURL: { url, filename },
            complain: complain,
            location: location,
            date: Date.now(),
            category: category,
        });

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Based on the complain "${newComplaint}", check the severity and give me one word for it. The words should be either Critical, Mild, or Low.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        const text = response.text();
        
        await complainModel.updateOne({ _id: newComplaint._id }, { $set: { severity: text } });

        if (text == 'Critical') {
            const userEmail = 'pawangupta5692@gmail.com';
            sendAcceptanceEmail(userEmail, complain, location, category);
        }

        req.flash("success", "New Listing Created!");
        res.redirect("/complaints");
    } catch (error) {
        console.error("Error uploading complaint:", error);
        req.flash("error", "Failed to create listing. Location not found.");
        res.redirect("/complaints");
    }
};

module.exports.showComplaint = async (req, res) => {
    const { id } = req.params;
    const complaint = await complainModel.findById(id).populate({
        path: "reviews",
        populate: { path: "author" },
    });
    res.render("listings/show.ejs", { complaint });
};

module.exports.supportComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const complaint = await complainModel.findByIdAndUpdate(
            id,
            { $inc: { supportCount: 1 }, $push: { expressusers: req.user._id } },
            { new: true }
        );

        if (!complaint) {
            return res.status(404).send({ message: "Complaint not found" });
        }
        res.redirect(`/complaints/${id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error updating support count" });
    }
};

module.exports.createReview = async (req, res) => {
    let { id } = req.params;
    let listing = await complainModel.findById(id);

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    
    res.redirect(`/complaints/${id}`);
};

module.exports.renderHeatmap = async (req, res) => {
    try {
        const complaints = await complainModel.find({});
        res.render('users/heatMap', { complaints: JSON.stringify(complaints) });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching complaints");
    }
};

module.exports.rateRoute = async (req, res) => {
    const routeDetails = req.body;
    try {
        const rating = await getRouteRating(routeDetails);
        res.json({ rating });
    } catch (error) {
        console.error('Error getting route rating:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

async function getRouteRating(routeDetails) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const routeDetailsJson = JSON.stringify(routeDetails);
    const prompt = `Based on the route details: ${routeDetailsJson}, check the severity: ${routeDetails.overallSeverity}, and give me the rating for the route from 1 to 5 stars (the rating can be decimal points also).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();
}

module.exports.renderTrend = async (req, res) => {
    try {
        const currentDate = new Date();
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 30);
        
        const trendData = await complainModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: currentDate,
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' },
                        category: '$category'
                    },
                    totalComplaints: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ]);

        const categories = ['Crime', 'Accident', 'Disturbance'];
        const aggregatedData = {};
        categories.forEach(category => {
            aggregatedData[category] = Array(30).fill(0);
        });

        const dateMap = new Map();
        for (let i = 0; i < 30; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            dateMap.set(key, i);
        }

        trendData.forEach(d => {
            const { year, month, day, category } = d._id;
            const dateKey = `${year}-${month}-${day}`;
            const index = dateMap.get(dateKey);
            if (index !== undefined && categories.includes(category)) {
                aggregatedData[category][index] += d.totalComplaints;
            }
        });

        res.render('listings/trend', { aggregatedData, categories });
    } catch (error) {
        console.error('Error fetching trends data:', error);
        res.status(500).send('Internal Server Error');
    }
};