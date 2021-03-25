const mongoose = require("mongoose");

const serviceSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
	username: String,
	picture: String,
	description: String,
	rate: String,
	category: String,
	duration: String,
	date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Service", serviceSchema);

// Notes
// - Lots of stuff is similar to asset model, but this is basic requirements, we can add more stuff later
// - duration could be the total duration required to learn the skill, or the length of each session, we can even make 2 different fields for this, @COFOUNDER input required
