import multer from "multer";

// Configure multer to use memory storage and set a file size limit of 5MB for uploaded files.

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

export default upload;
