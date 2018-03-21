const http = require("http");
const createHandler = require("github-webhook-handler");
const { env, passOn } = require("./env");
const hasReqs = require("./reqs");

hasReqs(env);
const handler = createHandler({ path: "/", secret: env.GIT_SECRET });
// hash package json
// git repo url
// enable DEBUG
// Take env variables to be passed to the process

// const deploy = require("./deploy");

// let deploying = false;

// async function runDeployment() {
//   console.log("Pushed to master will redeploy");
//   deploying = true;
//   const time = Date.now();
//   await deploy();
//   deploying = false;
//   console.log(`Deployed, took ${Date.now() - time}ms`);
// }

// runDeployment();

// http
//   .createServer(function(req, res) {
//     handler(req, res, function(err) {
//       res.statusCode = 404;
//       res.end("no such location");
//     });
//   })
//   .listen(3001);

// handler.on("error", function(err) {
//   console.error("Error:", err.message);
// });

// handler.on("push", async event => {
//   if (event.payload.ref.includes("master") && !deploying) {
//     runDeployment();
//   }
// });
