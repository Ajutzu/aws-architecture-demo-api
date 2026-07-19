import { sendError } from "../utils/response.js";

// Global error handling middleware for Express.js applications.
// This middleware captures any errors that occur during request 
// processing and sends a standardized error response to the client. 
// It handles specific cases such as file size limit errors and sets 
// appropriate HTTP status codes and messages.

export default function errorHandler(err, req, res, next) {
	if (res.headersSent) {
		return next(err);
	}

	const isFileSizeLimit = err.code === "LIMIT_FILE_SIZE";
	const statusCode = err.statusCode || (isFileSizeLimit ? 413 : 500);
	const message =
		(isFileSizeLimit && err.message) ||
		err.message ||
		(isFileSizeLimit ? "Image must be smaller than 5 MB." : "Internal server error.");
	const details = err.details || undefined;

	if (err.retryAfter) {
		res.setHeader("Retry-After", String(err.retryAfter));
	}

	return sendError(res, statusCode, message, details);
}
