const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var sleep = require("sleep");
const checkAuth = require("../middleware/check-auth");
const multer = require("multer");

const User = require("../models/user");
const Invite = require("../models/invite");

router.post("/signup", (req, res, next) => {
	User.find({ email: req.body.email })
		.exec()
		.then((user) => {
			if (user.length >= 1) {
				return res.status(409).json({
					message: "Email already exists",
				});
			}
			// } else {
			// if (req.body.password == null) {
			// 	return res.status(400).json({
			// 		error: "Password missing",
			// 	});
			// }
			// bcrypt.hash(req.body.password, 10, (err, hash) => {
			// 	if (err) {
			// 		return res.status(500).json({
			// 			error: err,
			// 		});
			// }
			else {
				const user = new User({
					_id: mongoose.Types.ObjectId(),
					email: req.body.email,
					// password: hash,
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
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
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
						email: user[0].email,
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
					picture: "/static/" + user[0].picture,
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

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./uploads/");
	},
	filename: function (req, file, cb) {
		cb(null, new Date().toISOString() + file.originalname);
	},
});

const fileFilter = (req, file, cb) => {
	if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

const upload = multer({
	storage: storage,
	limits: { fileSize: 1024 * 1024 * 5 },
	// fileFilter: fileFilter,
});

router.patch("/user", checkAuth, upload.fields([{ name: "UserImage", maxCount: 1 }]), (req, res, next) => {
	if (req.files["UserImage"] !== undefined) {
		file_name = req.files["UserImage"][0].filename;
		req.body.picture = file_name;
	}
	User.updateOne({ username: req.userData.username }, { $set: req.body })
		.exec()
		.then((result) => {
			console.log(result);
			res.status(200).json(result);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ error: err });
		});
});

router.get("/user", checkAuth, (req, res, next) => {
	User.findOne({ username: req.userData.username })
		.select("username email picture firstName lastName date")
		.exec()
		.then((doc) => {
			if (doc) {
				const userDetails = {
					username: doc.username,
					email: doc.email,
					userID: doc._id,
					picture: "/static/" + doc.picture,
					firstName: doc.firstName,
					lastName: doc.lastName,
					date: doc.date,
				};
				res.status(200).json(userDetails);
			} else {
				res.status(404).json({ message: "No Valid Entry Found" });
			}
		})
		.catch((err) => {
			console.log(err), res.status(500).json({ error: err });
		});
});

router.post("/sendInvite", checkAuth, (req, res, next) => {
	const userEmail = req.userData.email;
	let userID;
	User.findOne({ email: userEmail })
		.select("invitesNum")
		.exec()
		.then((doc) => {
			userID = doc._id;
			if (doc.invitesNum === 0) {
				return res.status(404).json({ message: "Out of invites" });
			} else {
				const email = req.body.email;
				// "send email" code here
				User.find({ email: email })
					.exec()
					.then((user) => {
						if (user.length >= 1) {
							return res.status(409).json({
								message: "Email already exists",
							});
						} else {
							const newUser = new User({ _id: mongoose.Types.ObjectId(), email: email });
							newUser
								.save()
								.then((userDocs) => {
									const inviteObj = new Invite({ _id: mongoose.Types.ObjectId(), invitedBy: userEmail, email: email });
									inviteObj
										.save()
										.then((inviteDocs) => {
											User.updateOne({ _id: userID }, { $inc: { invitesNum: -1 } }).exec();
											res.status(200).json({ message: "Invite sent successfully" });
										})
										.catch((err) => {
											console.log(err);
											res.status(500).json({
												error: err,
											});
										});
								})
								.catch((err) => {
									console.log(err);
									res.status(500).json({
										error: err,
									});
								});
						}
					});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				error: err,
			});
		});
});

module.exports = router;
