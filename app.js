const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
var cors = require("cors");

const loginRoute = require("./api/routes/login");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/login", loginRoute);

app.use((req, res, next) => {
	const error = new Error("Not found");
	error.status = 404;
	res.status(404).json({ ramu: "kaka" });
	next(error);
});

app.use((error, req, res, next) => {
	res.status(error.status || 500);
	res.json({
		error: {
			message: error.message,
		},
	});
});

module.exports = app;
