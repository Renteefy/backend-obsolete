const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const checkAuth = require("../middleware/check-auth");
const multer = require("multer");

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

const Asset = require("../models/asset");
const Notification = require("../models/notification");
const { response } = require("express");

// Add a new asset
router.post("/", checkAuth, upload.fields([{ name: "assetImage", maxCount: 1 }]), (req, res, next) => {
	const userData = req.userData;

	// To check that the logged in user's username is same as the "owner" field sent in the request body
	if (userData.username !== req.body.owner) {
		return res.status(400).json({ message: "Usernames don't match" });
	}

	let file_name;
	if (req.files["assetImage"] !== undefined) {
		file_name = req.files["assetImage"][0].filename;
	} else {
		file_name = null;
	}

	const reqParams = ["title", "owner", "description", "price", "interval", "category"];

	// if the required parameters are not the same as the parameters sent, the code returns response 400
	assetObj = { _id: mongoose.Types.ObjectId(), picture: file_name };
	for (const p of reqParams) {
		if (p in req.body) {
			assetObj[p] = req.body[p];
		} else {
			return res.status(400).json({ message: "Some required parameters missing" });
		}
	}

	const asset = new Asset(assetObj);
	asset
		.save()
		.then((result) => {
			res.status(200).json({
				message: "POST in asset",
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

// Get all the assets in the database
router.get("/", checkAuth, (req, res, next) => {
	Asset.find()
		.select("title picture price interval")
		.exec()
		.then((docs) => {
			if (docs) {
				const response = {
					count: docs.length,
					items: docs.map((doc) => {
						return {
							title: doc.title,
							price: doc.price,
							id: doc._id,
							interval: doc.interval,
							url: "/static/" + doc.picture,
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

router.get("/getsome/:skip/:limit/", checkAuth, (req, res, next) => {
	const skp = parseInt(req.params.skip);
	const lmt = parseInt(req.params.limit);
	Asset.find()
		.skip(skp)
		.limit(lmt)
		.select("title picture price interval date")
		.exec()
		.then((docs) => {
			if (docs) {
				const response = {
					count: docs.length,
					items: docs.map((doc) => {
						return {
							title: doc.title,
							price: doc.price,
							date: doc.date,
							id: doc._id,
							interval: doc.interval,
							url: "/static/" + doc.picture,
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

// Get the asset with asset ID
router.get("/asset/:assetId", checkAuth, (req, res, next) => {
	const assetId = req.params.assetId;
	const username = req.userData.username;
	Asset.findById(assetId)
		.select("title description price interval picture owner category")
		.exec()
		.then((doc) => {
			if (doc) {
				const assetResponse = {
					title: doc.title,
					price: doc.price,
					id: doc._id,
					interval: doc.interval,
					category: doc.category,
					description: doc.description,
					owner: doc.owner,
					url: "/static/" + doc.picture,
				};
				let alreadySentQuery = findAlreadySent(username, assetResponse.title);
				alreadySentQuery.exec((err, doc) => {
					if (err) return err;
					else res.status(200).json({ itemResponse: assetResponse, notifiResponse: doc });
				});
			} else {
				res.status(404).json({ message: "No Valid Entry Found" });
			}
		})
		.catch((err) => {
			console.log(err), res.status(500).json({ error: err });
		});
});

// Get all the assets posted by a particular user
router.get("/user/:owner", checkAuth, (req, res, next) => {
	const owner = req.params.owner;
	const userData = req.userData;

	// To check that the logged in user's username is same as the "owner" field sent in the request body
	if (userData.username !== owner) {
		return res.status(400).json({ message: "Usernames don't match" });
	}

	Asset.find({ owner: owner })
		.select("title picture price interval description owner renter")
		.exec()
		.then((docs) => {
			if (docs) {
				const response = {
					count: docs.length,
					items: docs.map((doc) => {
						return {
							title: doc.title,
							price: doc.price,
							id: doc._id,
							interval: doc.interval,
							description: doc.description,
							owner: doc.owner,
							renter: doc.renter,
							url: "/static/" + doc.picture,
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

// Delete the asset whose assetId is given
router.delete("/asset/:assetId", checkAuth, (req, res, next) => {
	Asset.deleteOne({ _id: req.params.assetId })
		.exec()
		.then((result) => {
			res.status(200).json({
				message: "Asset deleted",
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				error: err,
			});
		});
});

// This route basically edits the entire asset except the "renter" field
router.patch("/asset/:assetId", checkAuth, upload.fields([{ name: "assetImage", maxCount: 1 }]), (req, res, next) => {
	const id = req.params.assetId;
	const reqParams = ["title", "owner", "description", "price", "interval", "category"];
	if (req.files["assetImage"] !== undefined) {
		file_name = req.files["assetImage"][0].filename;
		req.body.picture = file_name;
		reqParams.push("picture");
	}

	for (const p of Object.keys(req.body)) {
		if (!reqParams.includes(p)) {
			console.log(p, "this is the extra parameter");
			return res.status(400).json({ message: "Extra parameters provided" });
		}
	}
	Asset.updateOne({ _id: id }, { $set: req.body })
		.exec()
		.then((result) => {
			res.status(200).json(result);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ error: err });
		});
});

// This route is specifically to edit the renter field in the asset given
router.patch("/asset/renter/:assetID", checkAuth, (req, res, next) => {
	const id = req.params.assetID;
	const props = ["renterUsername", "startDate", "endDate"];
	const changes = {};
	for (const p of props) {
		changes["renter." + p] = req.body[p];
	}
	Asset.updateOne({ _id: id }, { $set: changes })
		.exec()
		.then((result) => {
			res.status(200).json(result);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ error: err });
		});
});

// This route searches the notification collection to find if there exits a notifications sent for the given asset
function findAlreadySent(username, assetTitle) {
	let query = Notification.findOne({ rentee: username, title: assetTitle }).select("title status rentee assetID owner");
	return query;
}

// This route returns the list of assets where the logged in user is the renter
router.get("/userRented/", checkAuth, (req, res, next) => {
	const username = req.userData.username;
	Asset.find({ "renter.renterUsername": username })
		.select("title picture price interval description owner renter")
		.exec()
		.then((docs) => {
			if (docs) {
				const response = {
					count: docs.length,
					items: docs.map((doc) => {
						return {
							title: doc.title,
							price: doc.price,
							id: doc._id,
							interval: doc.interval,
							description: doc.description,
							owner: doc.owner,
							renter: doc.renter,
							url: "/static/" + doc.picture,
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

module.exports = router;
