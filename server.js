const http = require("http");
const app = require("./app");

const port = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(port, (err) => {
  if (err) console.error(err);
  console.log("Listening on port:", port);
});
