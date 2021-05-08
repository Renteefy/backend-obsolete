const User = require("../api/models/user");
const mongoose = require("mongoose");
let dbname;
if (process.env.NODE_ENV == "prod") dbname = "prod";
else dbname = "test";
mongoose.connect(`mongodb://localhost:27017/${dbname}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const argv = require("minimist")(process.argv.slice(2));
const username = argv["_"][0];
const email = argv["_"][1];
//const fs = require("fs");
//const csv = require("csv-parser");
const temp = {
  _id: mongoose.Types.ObjectId(),
  email: email,
  username: username,
};
const user = new User(temp);
user
  .save()
  .then(() => {
    console.log("done");
  })
  .catch((err) => {
    console.log(err);
  });
