const express = require("express");
const app = express();

const morgan = require("morgan");
const mongoose = require("mongoose");
var cors = require("cors");

const loginRoute = require("./api/routes/users");
const assetRoute = require("./api/routes/assets");
const serviceRoute = require("./api/routes/services");
const notificationRoute = require("./api/routes/notifications");
const populateDB = require("./api/routes/populateDB");

mongoose.connect("mongodb://localhost:27017", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use("/static", express.static("uploads"));

app.use("/users", loginRoute);
app.use("/assets", assetRoute);
app.use("/services", serviceRoute);
app.use("/notifications", notificationRoute);
app.use("/populateDB", populateDB);

// test route -  to check the if server is working
app.get("/test", (req, res) => {
	res.send({
		message: "The server is on. just like your mom when she sees me 💦",
	});
});

app.use((req, res, next) => {
	res.sendStatus(404);
});

module.exports = app;
