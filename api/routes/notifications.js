const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const checkAuth = require("../middleware/check-auth");

const Notification = require("../models/notification");
const user = require("../models/user");

// Add a new notification
router.post("/", checkAuth, (req, res, next) => {
	const userData = req.userData;
	const notification = new Notification({
		_id: mongoose.Types.ObjectId(),
		title: req.body.title,
		assetID: req.body.assetID,
		status: req.body.status,
		owner: req.body.owner,
		rentee: userData.username,
	});
	notification
		.save()
		.then((result) => {
			console.log(result);
			res.status(200).json({
				message: "POST in notification",
				id: result._id,
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				error: err,
			});
		});
});

// Get all the notifications in the database
router.get("/", checkAuth, (req, res, next) => {
	Notification.find()
		.select("title status owner rentee assetID")
		.exec()
		.then((docs) => {
			if (docs) {
				const response = {
					count: docs.length,
					notifications: docs.map((doc) => {
						return {
							notificationID: doc._id,
							title: doc.title,
							status: doc.status,
							owner: doc.owner,
							rentee: doc.rentee,
							assetID: doc.assetID,
						};
					}),
				};
				res.status(200).json(response);
			} else {
				res.status(404).json({ message: "No Valid Entry Found" });
			}
		})
		.catch((err) => {
			console.log(err), res.status(500).json({ error: err });
		});
});

// Get the notification with notification ID
router.get("/notification/:notificationId", checkAuth, (req, res, next) => {
	const notificationId = req.params.notificationId;
	Notification.findById(notificationId)
		.select("title status owner rentee")
		.exec()
		.then((doc) => {
			if (doc) {
				const response = {
					notificationID: doc._id,
					title: doc.title,
					status: doc.status,
					owner: doc.owner,
					rentee: doc.rentee,
					assetID: doc.assetID,
				};
				res.status(200).json(response);
			} else {
				res.status(404).json({ message: "No Valid Entry Found" });
			}
		})
		.catch((err) => {
			console.log(err), res.status(500).json({ error: err });
		});
});

// Get all the notifications where the owner is the logged in user
router.get("/user/", checkAuth, (req, res, next) => {
	const username = req.userData.username;
	Notification.find({ $or: [{ owner: username }, { rentee: username }] })
		.select("title status owner rentee assetID")
		.exec()
		.then((docs) => {
			if (docs) {
				res.status(200).json(docs);
			} else {
				res.status(404).json({ message: "No Valid Entry Found" });
			}
		})
		.catch((err) => {
			console.log(err), res.status(500).json({ error: err });
		});
});

// Returns whether the user has already sent the request or not
router.get("/user/alreadySent/:assetTitle", checkAuth, (req, res, next) => {
	const username = req.userData.username;
	const assetTitle = req.params.assetTitle;
	Notification.find({ rentee: username, title: assetTitle })
		.select("title status owner rentee assetID")
		.exec()
		.then((docs) => {
			if (docs.length >= 1) {
				res.status(200).json(docs);
			} else {
				res.status(404).json({ message: "No Valid Entry Found" });
			}
		})
		.catch((err) => {
			console.log(err), res.status(500).json({ error: err });
		});
});

// Delete the notification whose notificationId is given
router.delete("/notification/:notificationId", checkAuth, (req, res, next) => {
	Notification.deleteOne({ _id: req.params.notificationId })
		.exec()
		.then((result) => {
			res.status(200).json({
				message: "Notification deleted",
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				error: err,
			});
		});
});

// {
//     "changes":[
//         {
//             "propName": "status",
//             "value": "Request Raised"
//         }
//     ]
// }
router.patch("/notification/:notificationId", checkAuth, (req, res, next) => {
	const id = req.params.notificationId;
	const updateOps = {};
	for (const ops of req.body.changes) {
		updateOps[ops.propName] = ops.value;
	}
	console.log(updateOps);
	Notification.updateOne({ _id: id }, { $set: updateOps })
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

module.exports = router;
