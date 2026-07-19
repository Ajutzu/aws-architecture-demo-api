
// Formats date values into a human-readable format using the Intl.DateTimeFormat API.

export const formatDate = (value) => {
	if (!value) {
		return null;
	}

	const dateValue = value instanceof Date ? value : new Date(value);

	if (Number.isNaN(dateValue.getTime())) {
		return null;
	}

	try {
		return new Intl.DateTimeFormat("en-US", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(dateValue);
	} catch (error) {
		console.error("[date-formater:formatDate] Error:", error);
		throw error;
	}
};
