const Asset = require("../models/asset");
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/test", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
const iphone = {
	_id: mongoose.Types.ObjectId(),
	title: "iPhone",
	description: "This is the description of iPhone",
	price: "399",
	interval: "per day",
	owner: "tester1",
	category: "Technology and Electronics",
	// picture: "2021-04-12T07:27:33.621Z2021-04-03T09:58:17.393Z142227-phones-review-iphone-x-review-photos-image1-ahdsiyvum0.jpg",
	picture: "2021-04-12T07:26:34.858Z2021-04-03T09:58:17.393Z142227-phones-review-iphone-x-review-photos-image1-ahdsiyvum0.jpg",
};
const macbook = {
	_id: mongoose.Types.ObjectId(),
	title: "MacBook",
	description: "This is the description of MacBook",
	price: "599",
	interval: "per hour",
	owner: "tester1",
	category: "Technology and Electronics",
	// picture: "2021-04-12T08:21:36.699Zimage_picker9098464902421943739.jpg",
	picture: "2021-04-12T07:24:25.610Z2021-04-03T09:56:57.468Zimages.jpeg",
};
const bike = {
	_id: mongoose.Types.ObjectId(),
	title: "Bike",
	description: "This is the description of Bike",
	price: "599",
	interval: "per day",
	owner: "tester1",
	category: "Automobiles and Vehicles",
	// picture: "2021-04-12T07:32:34.798Z2021-04-03T10:00:48.227Zclassic-signals-660_090518073800.jpg",
	picture: "2021-04-12T07:31:12.023Z2021-04-03T10:00:48.227Zclassic-signals-660_090518073800.jpg",
};
const piano = {
	_id: mongoose.Types.ObjectId(),
	title: "Piano",
	description: "This is the description of Piano",
	price: "299",
	interval: "per hour",
	owner: "tester1",
	category: "Others",
	// picture: "2021-04-12T07:33:14.658Z2021-04-03T09:59:24.959Zcheap-keyboard-piano.jpg",
	picture: "2021-04-12T07:33:48.275Z2021-04-03T09:59:24.959Zcheap-keyboard-piano.jpg",
};
const headphones = {
	_id: mongoose.Types.ObjectId(),
	title: "Headphones",
	description: "This is the description of Headphones",
	price: "99",
	owner: "tester1",
	interval: "per day",
	category: "Technology and Electronics",
	// picture: "2021-04-12T07:28:50.837Z2021-04-03T10:02:12.932Z72425.jpg",
	picture: "2021-04-12T07:29:12.676Z2021-04-03T10:02:12.932Z72425.jpg",
};
const arr = [iphone, macbook, bike, piano, headphones];
async function popDb() {
	//console.log(arr);
	arr.map((item) => {
		const asset = new Asset(item);
		asset.save();
	});
}

popDb()
	.then(() => console.log("Done. kill this process now and run the npm run dev now. k bye."))
	.catch((err) => {
		console.log("err bruh");
	});
//module.exports = router;
