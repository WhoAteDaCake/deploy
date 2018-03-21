// const util = require("util");
// const exec = util.promisify(require("child_process").exec);

// const secret = "daddy";

// function getImageId(str) {
//   return str
//     .match(/^(Successfully built)\s(.*)$/gm)[0]
//     .replace("Successfully built ", "");
// }

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
