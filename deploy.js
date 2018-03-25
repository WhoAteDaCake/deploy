const debug = require("debug")("deploy");
const { spawn } = require("child_process");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { getImageId, asyncSpawnSeq, asyncSpawn } = require("./utils");
const { env } = require("./env");

async function updateRepo(path, name) {
  await asyncSpawnSeq(
    {
      stdout: m => debug("git: %s", m),
      stderr: m => debug("warning git: %s", m)
    },
    [
      ["git", ["reset", "--hard", "HEAD"], { cwd: path }],
      ["git", ["pull"], { cwd: path }],
      ["git", ["checkout", name], { cwd: path }],
      ["git", ["pull", "origin", name], { cwd: path }]
    ]
  );
}

// TODO clear old images?
function buildImage(path, name) {
  let log = "";
  return asyncSpawn(
    {
      stdout: m => {
        log += `${m}\n`;
        debug("docker: ", m);
      },
      stderr: m => debug("warning docker: %s", m)
    },
    ["docker", ["build", "-t", name, "."], { cwd: path }]
  ).then(() => getImageId(log));
}

async function startContainer(name, imageId, flags) {
  const command = `docker run --name ${name} ${flags}  ${imageId}`;
  const { stdout, stderr } = await exec(command);
  return stdout;
}

async function killOldContainer(imageName) {
  const { stdout } = await exec("docker ps -a");
  const containerId = stdout.split("\n").reduce((id, row) => {
    if (row.includes(imageName)) {
      return row.split(/\s/)[0];
    }
    return id;
  }, undefined);
  if (containerId !== undefined) {
    return exec(`docker rm -f ${containerId}`);
  }
}

module.exports = {
  buildImage,
  startContainer,
  killOldContainer,
  updateRepo
};
