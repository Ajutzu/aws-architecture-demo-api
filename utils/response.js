
// Constructs a standardized success response payload with the provided message, data, 
// and meta information.

const buildSuccessPayload = (message, data, meta) => {
	const payload = {
		success: true,
		message,
	};

	if (data !== undefined) {
		payload.data = data;
	}

	if (meta !== undefined) {
		payload.meta = meta;
	}

	return payload;
};

// Constructs a standardized error response payload with the provided 
// message and optional details.

const buildErrorPayload = (message, details) => {
	const payload = {
		success: false,
		message,
	};

	if (details !== undefined) {
		payload.details = details;
	}

	return payload;
};

// Sends a standardized success response with the provided status code,
//  message, and optional data and meta information.	

export const sendSuccess = (res, statusCode, message, data, meta) => {
	try {
		return res.status(statusCode).json(buildSuccessPayload(message, data, meta));
	} catch (error) {
		console.error("[response:sendSuccess] Error:", error);
		throw error;
	}
};

// Sends a standardized error response with the provided status code, message, and optional details.

export const sendError = (res, statusCode, message, details) => {
	try {
		return res.status(statusCode).json(buildErrorPayload(message, details));
	} catch (error) {
		console.error("[response:sendError] Error:", error);
		throw error;
	}
};
