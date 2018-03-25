const http = require("http");
const createHandler = require("github-webhook-handler");
const debug = require("debug")("server");
const { env, passOn } = require("./env");
const { getFileHash } = require("./utils");
const { updateModules } = require("./deploy");
const hasReqs = require("./reqs");

let packageJsonHash = "";
let deploying = false;
const repoPath = hasReqs(env);
const handler = createHandler({ path: "/", secret: env.GIT_SECRET });

async function initiateDeployment() {
  // Easiest way to prevent deployments coliding
  if (deploying) {
    return;
  }
  deploying = true;
  const newHash = getFileHash(repoPath, "package.json");
  if (newHash !== packageJsonHash) {
    packageJsonHash = newHash;
    updateModules(repoPath);
  }

  deploying = false;
}

http
  .createServer((req, res) => {
    handler(req, res, err => {
      res.statusCode = 404;
      res.end("no such location");
    });
  })
  .listen(env.PORT, env.IP, () => {
    debug("Started listening on %s:%s", env.IP, env.PORT);
    initiateDeployment();
  });

handler.on("error", err => {
  debug("Error: %s", err.message);
});

handler.on("push", async event => {
  if (event.payload.ref.includes("master") && !deploying) {
    initiateDeployment();
  }
});
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

// handler.on("error", function(err) {
//   console.error("Error:", err.message);
// });

// handler.on("push", async event => {
//   if (event.payload.ref.includes("master") && !deploying) {
//     runDeployment();
//   }
// });
