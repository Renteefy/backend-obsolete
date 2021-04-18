const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	username: String,
	password: { type: String, default: null },
	email: { type: String, default: null },
	picture: { type: String, default: null },
	firstName: { type: String, default: null },
	lastName: { type: String, default: null },
	date: { type: Date, default: Date.now },
	invitesNum: { type: Number, default: 3 },
	inviteList: [
		{
			inviteeName: String,
			inviteID: String,
		},
	],
});

module.exports = mongoose.model("User", userSchema);
