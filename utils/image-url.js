import { appConfig } from "../config/credential-holder.js";


// Generates a public URL for an image stored in an S3 bucket using the provided object key and the
// CloudFront URL from the appConfig. If the object key is not provided, it returns null. If the
// CloudFront URL is not configured, it returns the object key as is.

export const getImageUrl = (objectKey) => {
	if (!objectKey) {
		return null;
	}

	const baseUrl = appConfig.cloudFrontUrl.replace(/\/+$/, "");

	if (!baseUrl) {
		return objectKey;
	}

	return `${baseUrl}/${String(objectKey).replace(/^\/+/, "")}`;
};
