const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function getFileHash(dir, fileName) {
  const file = fs.readFileSync(path.join(dir, fileName), "utf8");
  return crypto
    .createHash("sha1")
    .update(file)
    .digest("hex");
}

module.exports = { getFileHash };
