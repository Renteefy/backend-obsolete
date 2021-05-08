const mongoose = require("mongoose");

const inviteSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	invitedBy: { type: String, default: "Renteefy" },
	date: { type: Date, default: Date.now },
	email: String,
});

module.exports = mongoose.model("Invite", inviteSchema);
