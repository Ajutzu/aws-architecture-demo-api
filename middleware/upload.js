import multer from "multer";
import { sendError } from "../utils/response.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return sendError(res, 413, "Image must be smaller than 5 MB.");
      }

      return sendError(res, 400, err.message);
    }

    if (err) {
      return next(err);
    }

    next();
  });
};