// const Asset = require("../api/models/asset");
// const Service = require("../api/models/service");
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
const path = argv["_"][0];
const fs = require("fs");
const csv = require("csv-parser");
fs.createReadStream(path)
  .pipe(csv())
  .on("data", (data) => {
    const temp = {
      _id: mongoose.Types.ObjectId(),
      email: data.email,
      username: data.username,
    };
    const user = new User(temp);
    user.save();
  })
  .on("end", () => {
    console.log(
      "Added all csv data to database. Exit this process by pressing ctrl + c"
    );
  });
