function getImageId(str) {
  return str
    .match(/^(Successfully built)\s(.*)$/gm)[0]
    .replace("Successfully built ", "");
}

module.exports = { getImageId };
