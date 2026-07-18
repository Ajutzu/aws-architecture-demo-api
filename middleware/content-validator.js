import { postCategories } from "../config/credential-holder.js";

// Creates a validation error with the provided message and details, 
// setting the status code to 400.

const createValidationError = (message, details) => {
	const error = new Error(message);

	error.statusCode = 400;
	error.details = details;

	return error;
};

// Checks if the request body contains valid post data, including description, 
// location, and category.

export default function contentValidator(req, res, next) {
	const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
	const location = typeof req.body.location === "string" ? req.body.location.trim() : "";
	const category = typeof req.body.category === "string" && req.body.category.trim() ? req.body.category.trim() : "General";

	if (!req.file) {
		return next(createValidationError("An image is required.", { field: "image" }));
	}

	if (!description) {
		return next(createValidationError("Description is required.", { field: "description" }));
	}

	if (description.length < 10) {
		return next(createValidationError("Description must be at least 10 characters long.", { field: "description" }));
	}

	if (description.length > 2000) {
		return next(createValidationError("Description must not exceed 2000 characters.", { field: "description" }));
	}

	if (!location) {
		return next(createValidationError("Location is required.", { field: "location" }));
	}

	if (location.length > 255) {
		return next(createValidationError("Location must not exceed 255 characters.", { field: "location" }));
	}

	if (!postCategories.includes(category)) {
		return next(createValidationError("Category is invalid.", { field: "category" }));
	}

	req.validatedPost = {
		description,
		location,
		category,
	};

	return next();
}
