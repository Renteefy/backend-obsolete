const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const checkAuth = require("../middleware/check-auth");
const axios = require("axios");
var FormData = require("form-data");

const URL = process.env.URL;

const iphone = {
	title: "iPhone",
	description: "This is the description of iPhone",
	price: "399",
	interval: "per day",
	category: "Technology and Electronics",
	picture: URL + "/static/2021-04-12T07:27:33.621Z2021-04-03T09:58:17.393Z142227-phones-review-iphone-x-review-photos-image1-ahdsiyvum0.jpg",
};
const macbook = {
	title: "MacBook",
	description: "This is the description of MacBook",
	price: "599",
	interval: "per hour",
	category: "Technology and Electronics",
	picture: URL + "/static/2021-04-12T08:21:36.699Zimage_picker9098464902421943739.jpg",
};
const bike = {
	title: "Bike",
	description: "This is the description of Bike",
	price: "599",
	interval: "per day",
	category: "Automobiles and Vehicles",
	picture: URL + "/static/2021-04-12T07:32:34.798Z2021-04-03T10:00:48.227Zclassic-signals-660_090518073800.jpg",
};
const piano = {
	title: "Piano",
	description: "This is the description of Piano",
	price: "299",
	interval: "per hour",
	category: "Other",
	picture: URL + "/static/2021-04-12T07:33:14.658Z2021-04-03T09:59:24.959Zcheap-keyboard-piano.jpg",
};
const headphones = {
	title: "Headphones",
	description: "This is the description of Headphones",
	price: "99",
	interval: "per day",
	category: "Technology and Electronics",
	picture: URL + "/static/2021-04-12T07:28:50.837Z2021-04-03T10:02:12.932Z72425.jpg",
};

const items = [iphone, macbook, bike, headphones, piano];
const params = ["title", "description", "price", "interval", "category"];
const value = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RlcjEiLCJ1c2VySWQiOiI2MDY1Yzc2MjFkNWYwNTI5YTBlYWM0NDQiLCJpYXQiOjE2MTgyMzQ5MzcsImV4cCI6MTYxODMyMTMzN30.fPBFNxvjJaLz0u3x1DlmWmRrwNSHL7wpH2nOds3oYR8";

router.post("/", (req, res, next) => {
	const pass = req.body.password;
	if (pass === process.env.PASS) {
		items.forEach(function (arrayItem) {
			let data = new FormData();
			params.forEach((prm) => {
				data.append(prm, arrayItem[prm]);
			});
			// data.append("AssetImage", axios.get(arrayItem["picture"]));
			axios.post(URL, data, {
				headers: { "Content-Type": "multipart/form-data", Authorization: value },
			});
		});
	} else {
		res.status(404).json({ message: "You are not authorised to populate database" });
	}
});

module.exports = router;
