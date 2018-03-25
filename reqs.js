const path = require("path");
const util = require("util");
const fs = require("fs");
const debug = require("debug")("requirements");
const exec = util.promisify(require("child_process").exec);

function hasReqs(env) {
  const repoPath =
    env.REPO_PATH[0] === "/" || env.REPO_PATH[0] === "~"
      ? env.REPO_PATH
      : path.join("./", env.REPO_PATH);

  if (!fs.existsSync(repoPath)) {
    debug("Repository path not found at '%s'", repoPath);
    process.exit(1);
  }
  const files = fs.readdirSync(repoPath);
  if (!files.includes("package.json")) {
    debug("package.json not found at'%s'", repoPath);
    process.exit(1);
  }
  return repoPath;
}

module.exports = hasReqs;
