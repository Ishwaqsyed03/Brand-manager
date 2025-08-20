const validImageTypes = ["image/jpeg", "image/png"];
const validVideoTypes = ["video/mp4", "video/quicktime"];

exports.checkMedia = (file) => {
  if (validImageTypes.includes(file.mimetype)) return "image";
  if (validVideoTypes.includes(file.mimetype)) return "video";
  return null;
};

