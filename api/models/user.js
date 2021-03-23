const mongoose = require("mongoose");

const workoutSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	username: String,
	password: String,
	date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Workout", workoutSchema);
