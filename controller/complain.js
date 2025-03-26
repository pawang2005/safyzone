require("dotenv").config();
const { OpenAI } = require('openai');
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});
let cachedTips = null;
let lastCacheTime = 0;
const CACHE_DURATION = 1000 * 60 * 60 * 6;
const Review = require("../models/review.js");
const complainModel = require("../models/complaint.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const ejs = require("ejs");
const path = require("path");
const nodemailer = require("nodemailer");
const {Incident} = require("../models/incident.js");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL,
    pass: process.env.PASSWORD,
  },
});

const sendAcceptanceEmail = (userEmail, complain1, location1, category1) => {
  ejs.renderFile(
    path.join(__dirname, "..", "views", "emails", "emailTemplate.ejs"),
    {
      complain: complain1,
      location: location1,
      category: category1,
    },
    (err, data) => {
      if (err) {
        console.log("Error rendering EJS:", err);
        return;
      }

      let mailOptions = {
        from: '"SafyZone" <your-email@gmail.com>',
        to: userEmail,
        subject: "Incident Report!",
        html: data,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });
    }
  );
};




module.exports.index = async (req, res) => {
  const complaints = await complainModel.find({});
  
  // Use cached tips if available and not expired
  if (cachedTips && Date.now() - lastCacheTime < CACHE_DURATION) {
    return renderPage(req, res, complaints, cachedTips);
  }
  
  // Otherwise fetch fresh tips
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      messages: [{
        "role": "user",
        "content": "Give me only some general tips and women safety tips for general route safety.Make sure if it is a tip start it with -.Make different array for general and women safety tips See to it you give me only 5 tips. Just give me only tips dont start with any other sentence or header. Just give me the tips in a list format and dont give me any other thing. The tips should be related to route safety and security. The tips should be in a list format and the tips should be in a single line.",
      }],
    });
    
    let tipsText = completion.choices[0].message.content;
    cachedTips = tipsText.split("\n").filter(tip => tip.trim() !== "");
    lastCacheTime = Date.now();
    
    return renderPage(req, res, complaints, cachedTips);
  } catch (error) {
    console.error("Failed to fetch tips:", error);
    // Use empty tips if API fails
    return renderPage(req, res, complaints, []);
  }
};
async function renderPage(req, res, complaints, tipsArray) {
  if (req.user) {
    let Incidents = await Incident.find({user: req.user._id});
    res.render("listings/index.ejs", { 
      complaints, 
      Incidents, 
      msg: req.flash("success"), 
      deepseekAPI: process.env.DEEPSKEE_API_KEY,
      tipsArray 
    });
  } else {
    let Incidents = [{}];
    res.render("listings/index.ejs", { 
      complaints, 
      Incidents, 
      msg: req.flash("success"), 
      deepseekAPI: process.env.DEEPSKEE_API_KEY,
      tipsArray 
    });
  }
}

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

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Based on the complain "${newComplaint}", check the severity and give me one word for it. The words should be either Critical, Mild, or Low.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const text = response.text().trim();

    await complainModel.updateOne(
      { _id: newComplaint._id },
      { $set: { severity: text } }
    );

    if (text == "Critical") {
      console.log("Critical complaint:", text);
      const userEmail = "pawangupta5692@gmail.com";
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
    if(req.user){
    let Incidents = await Incident.find({user: req.user._id});
    res.render("users/heatMap", { complaints: JSON.stringify(complaints), Incidents });
    }
    else{
      let Incidents = [{}];
      res.render("users/heatMap", { complaints: JSON.stringify(complaints), Incidents });
    }
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
    console.error("Error getting route rating:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

async function getRouteRating(routeDetails) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const routeDetailsJson = JSON.stringify(routeDetails);
  const prompt = `Based on the route details: ${routeDetailsJson}, check the severity: ${routeDetails.overallSeverity}, and give me the rating for the route from 1 to 5 stars (the rating can be decimal points also) Also see to it that the rating is based on the severity of the route and try to see if there are more than 10 incident then go for 1 or 2 star and if it is less tham 10 than see to it you give around 3 to 5.`;

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
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
            category: "$category",
          },
          totalComplaints: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    const categories = ["Crime", "Accident", "Disturbance"];
    const aggregatedData = {};
    categories.forEach((category) => {
      aggregatedData[category] = Array(30).fill(0);
    });

    const dateMap = new Map();
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const key = `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`;
      dateMap.set(key, i);
    }

    trendData.forEach((d) => {
      const { year, month, day, category } = d._id;
      const dateKey = `${year}-${month}-${day}`;
      const index = dateMap.get(dateKey);
      if (index !== undefined && categories.includes(category)) {
        aggregatedData[category][index] += d.totalComplaints;
      }
    });

    res.render("listings/trend", { aggregatedData, categories });
  } catch (error) {
    console.error("Error fetching trends data:", error);
    res.status(500).send("Internal Server Error");
  }
};
