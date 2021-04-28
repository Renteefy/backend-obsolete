const jwt = require("jsonwebtoken");
let ramu = {};

module.exports = (req, res, next) => {
	try {
		const token = req.headers.authorization;
		const decoded = jwt.verify(token, "secret");
		if (decoded["username"] in ramu) {
			ramu[decoded["username"]] += 1;
		} else {
			ramu[decoded["username"]] = 1;
		}
		console.log(ramu);
		req.userData = decoded;
		next();
	} catch (error) {
		return res.status(401).json({
			message: "Auth failed",
		});
	}
};
