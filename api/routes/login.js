const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const checkAuth = require("../middleware/check-auth");
const jwt = require("jsonwebtoken");

router.post("/", (req, res, next) => {
	username = req.body.username;
	password = req.body.password;
	if (username === "ramukaka" && password === "jay") {
		const token = jwt.sign(
			{
				email: "test@email",
				userId: "test_userID",
			},
			"secret",
			{
				expiresIn: "1h",
			}
		);
		return res.status(200).json({
			message: "Auth successful",
			token: token,
		});
	} else {
		res.status(404).json({
			message: "kill yourself",
		});
	}
});

module.exports = router;
