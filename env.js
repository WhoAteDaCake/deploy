const debug = require("debug")("main:env");
const ENV_VARS = ["REPO_PATH", "BRANCH", "GIT_SECRET", "PORT", "IP"];

if (!process.env.DEBUG) {
  console.warn(
    "Debugging logs not shown, pass DEBUG=main env variable to show all"
  );
}

const env = ENV_VARS.reduce((dict, path) => {
  if (process.env[path] === undefined) {
    debug(`Could not find ${path} inside process.env`);
    process.exit(1);
  }
  return Object.assign(dict, { [path]: process.env[path] });
}, {});

const passOn = [];
const args = process.argv;
for (let i = 0, len = args.length; i < len; i += 1) {
  // TODO validate that correctly passed
  if (args[i] === "-e") {
    passOn.push(`${args[i + 1]}=${args[i + 2]}`);
    i += 2;
  }
}
module.exports = {
  env,
  passOn: passOn.join(" ")
};
