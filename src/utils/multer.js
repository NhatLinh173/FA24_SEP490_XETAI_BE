const multer = require("multer");
const multerMemoryStorage = multer.memoryStorage(); // Sử dụng bộ nhớ

const upload = multer({ storage: multerMemoryStorage });

module.exports = upload;
