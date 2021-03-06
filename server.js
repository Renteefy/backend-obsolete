//const https = require("https");
const http = require("http");
const app = require("./app");
const port = process.env.PORT || 5000;
require("dotenv").config();

async function resolveCertificates() {
  const https = require("https");
  const httpsLocalhost = require("https-localhost")();
  const certs = await httpsLocalhost.getCerts();
  const server = https.createServer(certs, app);
  console.log(process.env.NODE_ENV);

  server.listen(port, (err) => {
    if (err) console.error(err);
    console.log("Listening on port:", port);
  });
}

if (process.env.NODE_ENV == "dev") {
  resolveCertificates();
} else {
  const server = http.createServer(app);
  console.log(process.env.NODE_ENV);

  server.listen(port, (err) => {
    if (err) console.error(err);
    console.log("Listening on port:", port);
  });
}
