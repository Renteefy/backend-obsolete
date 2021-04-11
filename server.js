const https = require("https");
const app = require("./app");

const port = process.env.PORT || 5000;

//const server = http.createServer(app);

const httpsLocalhost = require("https-localhost")();

async function resolveCertificates() {
  const certs = await httpsLocalhost.getCerts();
  console.log(certs);
  const server = https.createServer(certs, app);

  server.listen(port, (err) => {
    if (err) console.error(err);
    console.log("Listening on port:", port);
  });
}

resolveCertificates();
