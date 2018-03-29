const http = require("http");
const createHandler = require("github-webhook-handler");
const debug = require("debug")("server");
const { env, passOn } = require("./env");
const {
  buildImage,
  startContainer,
  killOldContainer,
  updateRepo
} = require("./deploy");
const hasReqs = require("./reqs");

let deploying = false;
const repoPath = hasReqs(env);
const handler = createHandler({ path: "/", secret: env.GIT_SECRET });

async function initiateDeployment() {
  // Easiest way to prevent deployments coliding
  if (deploying) {
    return;
  }
  deploying = true;
  try {
    debug("Updating repository");
    await updateRepo(repoPath, env.BRANCH);
    debug("Done");
    // TODO, kill old container
    debug("Building docker image");
    const imageId = await buildImage(repoPath, env.IMAGE_NAME);
    debug("Docker image (%s) built", imageId);
    // Remove previous container
    debug("Killing old container");
    await killOldContainer(env.IMAGE_NAME);
    debug("Done");
    //
    debug("Starting docker container");
    const containerId = await startContainer(
      env.CONTAINER_NAME,
      imageId,
      env.DOCKER_FLAGS
    );
    debug("Container running at id %s", containerId);
  } catch (e) {
    debug("Failed to deploy");
    debug("%O", e);
  }
  debug("Deployment complete");
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
  if (event.payload.ref.includes(env.BRANCH) && !deploying) {
    initiateDeployment();
  }
});
