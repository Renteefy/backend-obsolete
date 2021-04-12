//const https = require("https");
const http = require("http");
const app = require("./app");

const port = process.env.PORT || 5000;

const server = http.createServer(app);

//const httpsLocalhost = require("https-localhost")();

async function resolveCertificates() {
  const https = require("https");
  const httpsLocalhost = require("https-localhost")();
  const certs = await httpsLocalhost.getCerts();
  console.log(certs);
  const server = https.createServer(certs, app);
  console.log(process.env.NODE_ENV);
  server.listen(port, (err) => {
    if (err) console.error(err);
    console.log("Listening on port:", port);
  });
}

if (process.env.NODE_ENV == "prod") {
  const server = http.createServer(app);
  console.log(process.env.NODE_ENV);
  server.listen(port, (err) => {
    if (err) console.error(err);
    console.log("Listening on port:", port);
  });
} else {
  resolveCertificates();
}
