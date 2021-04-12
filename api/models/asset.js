const mongoose = require("mongoose");

const assetSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: String,
  owner: String,
  picture: String,
  description: String,
  price: String,
  interval: String,
  category: String,
  renter: {
    renterUsername: { type: String, default: null },
    startDate: String,
    endDate: String,
  },
  waitingList: [String],
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Asset", assetSchema);

// Notes:
// - Username is the unique identifier for each user
// - Rate could be per hour, per week, per session => (This logic needs to be figured out, maybe enum?)
// - Category will be useful when the "Assets Homepage" layout shown, reference figma
