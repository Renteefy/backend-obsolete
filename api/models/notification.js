const mongoose = require("mongoose");

const NotificationSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	title: String,
	status: String,
	owner: String,
	rentee: String,
	date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);
