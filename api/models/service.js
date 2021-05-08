const mongoose = require("mongoose");

const serviceSchema = mongoose.Schema({
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

module.exports = mongoose.model("Service", serviceSchema);
