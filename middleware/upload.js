import multer from "multer";

// multer configuration for handling file uploads

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Middleware function to handle file uploads using multer. 
// It processes the uploaded file and handles any errors that may occur
//  during the upload process, such as exceeding the file size limit.

export default (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        err.statusCode = 413;
        err.message = "Image must be smaller than 5 MB.";
      } else {
        err.statusCode = 400;
      }

      return next(err);
    }

    if (err) {
      return next(err);
    }

    next();
  });
};
