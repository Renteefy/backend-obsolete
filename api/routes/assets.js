const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const checkAuth = require("../middleware/check-auth");
const multer = require("multer");
var sleep = require("sleep");

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
const user = require("../models/user");

// Add a new asset
router.post("/", checkAuth, upload.fields([{ name: "AssetImage", maxCount: 1 }]), (req, res, next) => {
	const userData = req.userData;
	let file_name;
	if (req.files["AssetImage"] !== undefined) {
		file_name = req.files["AssetImage"][0].filename;
	} else {
		file_name = null;
	}
	const asset = new Asset({
		_id: mongoose.Types.ObjectId(),
		title: req.body.title,
		owner: userData.username,
		description: req.body.description,
		picture: file_name,
		price: req.body.price,
		interval: req.body.interval,
		category: req.body.category,
	});
	asset
		.save()
		.then((result) => {
			console.log(result);
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
					assets: docs.map((doc) => {
						return {
							title: doc.title,
							price: doc.price,
							assetID: doc._id,
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
	// sleep.sleep(5);
	const skp = parseInt(req.params.skip);
	const lmt = parseInt(req.params.limit);
	Asset.find()
		.skip(skp)
		.limit(lmt)
		.select("title picture price interval")
		.exec()
		.then((docs) => {
			if (docs) {
				const response = {
					count: docs.length,
					assets: docs.map((doc) => {
						return {
							title: doc.title,
							price: doc.price,
							assetID: doc._id,
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
		.select("title description price interval picture owner")
		.exec()
		.then((doc) => {
			if (doc) {
				const assetResponse = {
					title: doc.title,
					price: doc.price,
					assetID: doc._id,
					interval: doc.interval,
					description: doc.description,
					owner: doc.owner,
					url: "/static/" + doc.picture,
				};
				let alreadySentQuery = findAlreadySent(username, assetResponse.title);
				alreadySentQuery.exec((err, doc) => {
					if (err) return err;
					else res.status(200).json({ assetResponse: assetResponse, notifiResponse: doc });
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
// @dj should the username here default to the logged in person ka username?
router.get("/user/:owner", checkAuth, (req, res, next) => {
	const owner = req.params.owner;
	Asset.find({ owner: owner })
		.select("title picture price interval")
		.exec()
		.then((docs) => {
			if (docs) {
				console.log(docs);
				const response = {
					count: docs.length,
					assets: docs.map((doc) => {
						return {
							title: doc.title,
							price: doc.price,
							assetID: doc._id,
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

function findAlreadySent(username, assetTitle) {
	console.log(username, assetTitle);
	let query = Notification.findOne({ rentee: username, title: assetTitle }).select("title status rentee assetID owner");

	return query;
}

module.exports = router;
