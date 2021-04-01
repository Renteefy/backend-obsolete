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

const Service = require("../models/service");

// Add a new service
router.post("/", checkAuth, upload.single("serviceImage"), (req, res, next) => {
	const userData = req.userData;
	const service = new Service({
		_id: mongoose.Types.ObjectId(),
		name: req.body.name,
		username: userData.username,
		picture: req.file.filename,
		description: req.body.description,
		rate: req.body.rate,
		category: req.body.category,
		duration: req.body.duration,
	});
	service
		.save()
		.then((result) => {
			console.log(result);
			res.status(200).json({
				message: "POST in service",
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

// Get all the services in the database
router.get("/", checkAuth, (req, res, next) => {
	Service.find()
		.select("name description rate category picture duration username")
		.exec()
		.then((doc) => {
			if (doc) {
				res.status(200).json(doc);
			} else {
				res.status(404).json({ message: "No Valid Entry Found" });
			}
		})
		.catch((err) => {
			console.log(err), res.status(500).json({ error: err });
		});
});

// Get the service with service ID
router.get("/service/:serviceId", checkAuth, (req, res, next) => {
	const serviceId = req.params.serviceId;
	Service.findById(serviceId)
		.select("name description rate category picture duration username")
		.exec()
		.then((doc) => {
			if (doc) {
				res.status(200).json(doc);
			} else {
				res.status(404).json({ message: "No Valid Entry Found" });
			}
		})
		.catch((err) => {
			console.log(err), res.status(500).json({ error: err });
		});
});

// Get all the services posted by a particular user
router.get("/user/:username", checkAuth, (req, res, next) => {
	const username = req.params.username;
	Service.find({ username: username })
		.select("name description rate category picture duration username")
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

// Delete the service whose serviceId is given
router.delete("/service/:serviceId", checkAuth, (req, res, next) => {
	Service.remove({ serviceId: req.params.serviceId })
		.exec()
		.then((result) => {
			res.status(200).json({
				message: "service deleted",
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
