const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var sleep = require("sleep");

const User = require("../models/user");

router.post("/signup", (req, res, next) => {
	User.find({ username: req.body.username })
		.exec()
		.then((user) => {
			if (user.length >= 1) {
				return res.status(409).json({
					message: "user already exists",
				});
			} else {
				if (req.body.password == null) {
					return res.status(400).json({
						error: "Password missing",
					});
				}
				bcrypt.hash(req.body.password, 10, (err, hash) => {
					if (err) {
						return res.status(500).json({
							error: err,
						});
					} else {
						const user = new User({
							_id: mongoose.Types.ObjectId(),
							username: req.body.username,
							password: hash,
						});
						user.save()
							.then((result) => {
								res.status(201).json({
									message: "User Created",
								});
							})
							.catch((err) => {
								console.log(err);
								res.status(500).json(err);
							});
					}
				});
			}
		});
});

router.post("/login", (req, res, next) => {
	// sleep.sleep(5);
	User.find({ username: req.body.username })
		.exec()
		.then((user) => {
			if (user.length < 1) {
				return res.status(401).json({
					message: "Auth failed",
				});
			} else {
				// bcrypt.compare(req.body.password, user[0].password, (err, result) => {
				// 	if (err) {
				// 		return res.status(401).json({
				// 			message: "Auth failed",
				// 		});
				// 	}
				// 	if (result) {
				const token = jwt.sign(
					{
						username: user[0].username,
						userId: user[0]._id,
					},
					"secret",
					{
						expiresIn: "24h",
					}
				);
				console.log(user[0].username + " logged in");
				return res.status(200).json({
					message: "Auth successful",
					token: token,
					username: user[0].username,
				});
			}
			// return res.status(401).json({
			// 	message: "Auth failed",
			// });
		})
		// 	}
		// })
		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
		});
});

router.delete("/:username", (req, res, next) => {
	User.remove({ username: req.params.username })
		.exec()
		.then((result) => {
			res.status(200).json({
				message: "User deleted",
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				error: err,
			});
		});
});

module.exports = router;
