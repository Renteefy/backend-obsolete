const http = require("http");
const app = require("./app");
const hostname = "0.0.0.0";

const port = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(port, hostname, (err) => {
  if (err) console.error(err);
  console.log("Listening on port:", port);
});
