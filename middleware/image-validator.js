const allowedMimeTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

// Creates a validation error with the provided message and details,

const createValidationError = (message, details) => {
	const error = new Error(message);

	error.statusCode = 400;
	error.details = details;

	return error;
};

// Validates the uploaded image file in the request, 
// ensuring it exists and has an allowed MIME type.

export default function imageValidator(req, res, next) {
	if (!req.file) {
		return next(createValidationError("An image file is required.", { field: "image" }));
	}

	if (!allowedMimeTypes.has(req.file.mimetype)) {
		return next(
			createValidationError("Only JPEG, JPG, PNG, and WebP images are allowed.", {
				field: "image",
				allowedTypes: Array.from(allowedMimeTypes),
			})
		);
	}

	return next();
}
