const mongoose = require("mongoose");
const user = require("./user");
const Schema = mongoose.Schema;
const Incident = mongoose.model("Incident", new mongoose.Schema({
    location: { lat: Number, lng: Number },
    type: String,
    severity: String,
    user: { type: Schema.Types.ObjectId, ref: user },
}));

module.exports = {Incident}