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
const Notification = require("../models/notification");

// Add a new service
router.post("/", checkAuth, upload.fields([{ name: "serviceImage", maxCount: 1 }]), (req, res, next) => {
	const userData = req.userData;

	// To check that the logged in user's username is same as the "owner" field sent in the request body
	if (userData.username !== req.body.owner) {
		return res.status(400).json({ message: "Usernames don't match" });
	}

	let file_name;
	if (req.files["serviceImage"] !== undefined) {
		file_name = req.files["serviceImage"][0].filename;
	} else {
		file_name = null;
	}

	const reqParams = ["title", "owner", "description", "price", "interval", "category"];

	// if the required parameters are not the same as the parameters sent, the code returns response 400
	serviceObj = { _id: mongoose.Types.ObjectId(), picture: file_name };
	for (const p of reqParams) {
		if (p in req.body) {
			serviceObj[p] = req.body[p];
		} else {
			return res.status(400).json({ message: "Some required parameters missing" });
		}
	}

	const service = new Service(serviceObj);
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
		.select("title picture price interval category")
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
							category: doc.category,
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
	Service.find()
		.skip(skp)
		.limit(lmt)
		.select("title picture price interval date category")
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
							category: doc.category,
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

// Get the service with service ID
router.get("/service/:serviceId", checkAuth, (req, res, next) => {
	const serviceId = req.params.serviceId;
	const username = req.userData.username;
	Service.findById(serviceId)
		.select("title description price interval picture owner category")
		.exec()
		.then((doc) => {
			if (doc) {
				const serviceResponse = {
					title: doc.title,
					price: doc.price,
					id: doc._id,
					interval: doc.interval,
					category: doc.category,
					description: doc.description,
					owner: doc.owner,
					url: "/static/" + doc.picture,
				};
				let alreadySentQuery = findAlreadySent(username, serviceResponse.id);
				alreadySentQuery.exec((err, doc) => {
					if (err) return err;
					else res.status(200).json({ itemResponse: serviceResponse, notifiResponse: doc });
				});
			} else {
				res.status(404).json({ message: "No Valid Entry Found" });
			}
		})
		.catch((err) => {
			console.log(err), res.status(500).json({ error: err });
		});
});

// Get all the services posted by a particular user
router.get("/user/:owner", checkAuth, (req, res, next) => {
	const owner = req.params.owner;
	const userData = req.userData;

	// To check that the logged in user's username is same as the "owner" field sent in the request body
	if (userData.username !== owner) {
		return res.status(400).json({ message: "Usernames don't match" });
	}

	Service.find({ owner: owner })
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

// Delete the service whose serviceId is given
router.delete("/service/:serviceId", checkAuth, (req, res, next) => {
	Service.deleteOne({ _id: req.params.serviceId })
		.exec()
		.then((result) => {
			res.status(200).json({
				message: "Service deleted",
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				error: err,
			});
		});
});

// This route basically edits the entire service except the "renter" field
router.patch("/service/:serviceId", checkAuth, upload.fields([{ name: "serviceImage", maxCount: 1 }]), (req, res, next) => {
	const id = req.params.serviceId;
	const reqParams = ["title", "owner", "description", "price", "interval", "category"];
	if (req.files["serviceImage"] !== undefined) {
		file_name = req.files["serviceImage"][0].filename;
		req.body.picture = file_name;
		reqParams.push("picture");
	}

	for (const p of Object.keys(req.body)) {
		if (!reqParams.includes(p)) {
			console.log(p, "this is the extra parameter");
			return res.status(400).json({ message: "Extra parameters provided" });
		}
	}
	Service.updateOne({ _id: id }, { $set: req.body })
		.exec()
		.then((result) => {
			res.status(200).json(result);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ error: err });
		});
});

// This route is specifically to edit the renter field in the given service
router.patch("/service/renter/:serviceID", checkAuth, (req, res, next) => {
	const id = req.params.serviceID;
	const props = ["renterUsername", "startDate", "endDate"];
	const changes = {};
	for (const p of props) {
		changes["renter." + p] = req.body[p];
	}
	Service.updateOne({ _id: id }, { $set: changes })
		.exec()
		.then((result) => {
			res.status(200).json(result);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ error: err });
		});
});

// This route searches the notification collection to find if there exits a notifications sent for the given service
function findAlreadySent(username, serviceid) {
	let query = Notification.findOne({ rentee: username, itemID: serviceid }).select("title status rentee serviceID owner date");
	return query;
}

// This route returns the list of services where the logged in user is the renter
router.get("/userRented/", checkAuth, (req, res, next) => {
	const username = req.userData.username;
	Service.find({ "renter.renterUsername": username })
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
