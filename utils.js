const { spawn } = require("child_process");

function getImageId(str) {
  return str
    .match(/^(Successfully built)\s(.*)$/gm)[0]
    .replace("Successfully built ", "");
}

function asyncSpawn(handlers, spawnArgs) {
  return new Promise((res, rej) => {
    const proc = spawn(...spawnArgs);

    let outMessage = "";
    let outLine = "";
    let log = "";
    proc.stdout.on("data", chunk => {
      outMessage += chunk.toString();
      log += chunk.toString();
      if (outMessage.includes("\n")) {
        [outLine, outMessage] = outMessage.split("\n");
        handlers.stdout(outLine);
      }
    });

    let errMessage = "";
    let errLine = "";
    proc.stderr.on("data", chunk => {
      errMessage += chunk.toString();
      if (errMessage.includes("\n")) {
        [errLine, errMessage] = errMessage.split("\n");
        handlers.stderr(errLine);
      }
    });

    proc.on("close", code => res([log, code]));
  });
}

function asyncSpawnSeq(handlers, spawns) {
  return spawns.reduce(
    (p, spawn) => p.then(() => asyncSpawn(handlers, spawn)),
    Promise.resolve()
  );
}

module.exports = { getImageId, asyncSpawnSeq, asyncSpawn };
