const multer = require("multer");
const multerMemoryStorage = multer.memoryStorage();

const upload = multer({ storage: multerMemoryStorage });

module.exports = upload;
