const debug = require("debug")("deploy");
const { spawn } = require("child_process");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { getImageId } = require("./utils");
const { env } = require("./env");

// TODO clear old images?
function buildImage(path, name) {
  return new Promise((res, rej) => {
    const dockerP = spawn("docker", ["build", "-t", name, "."], { cwd: path });
    let log = "";
    let message = "";
    dockerP.stdout.on("data", e => {
      log += e.toString();
      message += e.toString();
      if (message.includes("\n")) {
        const [m, rest] = message.split("\n");
        message = rest;
        debug("docker: ", m);
      }
    });
    dockerP.stderr.on("data", e => {
      debug("warning docker: %s", e.toString());
    });
    dockerP.on("close", e => {
      res(getImageId(log));
    });
  });
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
  killOldContainer
};

// function getContainerId(str) {
//   return /^([^\s]*).*group17$/gm.exec(str)[1];
// }

// async function run(command) {
//   let resp;
//   let error;
//   const { stdout, stderr } = await exec(command.replace("\n", ""));
//   if (stderr) {
//     console.error(stderr);
//     console.log(stdout);
//   }
//   return stdout;
// }

// const containerName = "group17";

// async function deploy() {
//   try {
//     const imageId = await run(`
//     cd ./group-17 &&
//     git pull origin master &&
//     docker build -t group17-docker .
//   `).then(getImageId);

//     const containerId = await run("docker ps").then(getContainerId);
//     await run(`docker stop ${containerId}`).then(() =>
//       run(`docker rm ${containerId}`)
//     );

//     const runResp = await run(`
//     docker run --name ${containerName} -d -p 3030:8080 -e BASE_URL='http://group17.augustinas.me' ${imageId}
//   `);
//   } catch (e) {
//     console.error(e);
//   }
// }
// module.exports = deploy;
