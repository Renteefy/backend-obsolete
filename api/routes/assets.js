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

// Add a new asset
router.post("/", checkAuth, upload.single("AssetImage"), (req, res, next) => {
	const userData = req.userData;
	const asset = new Asset({
		_id: mongoose.Types.ObjectId(),
		title: req.body.title,
		username: userData.username,
		picture: req.file.filename,
		description: req.body.description,
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
							url: "static/" + doc.picture,
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
	Asset.findById(assetId)
		.select("title description price interval picture username")
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
							description: doc.description,
							url: "static/" + doc.picture,
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

// Get all the assets posted by a particular user
// @dj should the username here default to the logged in person ka username?
router.get("/user/:username", checkAuth, (req, res, next) => {
	const username = req.params.username;
	Asset.find({ username: username })
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
							url: "static/" + doc.picture,
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

module.exports = router;

// Notes:
// - POST/DELETE requests need to return meaningful responses
// - Which fields are required and which are optional needs to be discussed
