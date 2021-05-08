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
		startDate: { type: String, default: null },
		endDate: { type: String, default: null },
	},
	waitingList: [String],
	date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Asset", assetSchema);
