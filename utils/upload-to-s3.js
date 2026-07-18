import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { appConfig } from "../config/credential-holder.js";

// Santize the file name by removing the extension, converting to lowercase,
// replacing non-alphanumeric characters with hyphens, and triming
// Leading and trailing hyphens. If the sanitized name is empty, it defaults to "image".

const sanitizeFileName = (fileName) => {
	const baseName = String(fileName || "image")
		.toLowerCase()
		.replace(/\.[^.]+$/, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return baseName || "image";
};

// Upload a file to the specified S3 bucket using the provided file object.

export const uploadToS3 = async (file) => {
	if (!file || !file.buffer) {
		const error = new Error("Image file is required for upload.");
		error.statusCode = 400;
		throw error;
	}

	if (!appConfig.awsBucketName) {
		const error = new Error("AWS bucket name is not configured.");
		error.statusCode = 500;
		throw error;
	}

	const fileKey = `posts/${Date.now()}-${randomUUID()}-${sanitizeFileName(file.originalname)}`;

	await s3Client.send(
		new PutObjectCommand({
			Bucket: appConfig.awsBucketName,
			Key: fileKey,
			Body: file.buffer,
			ContentType: file.mimetype,
		})
	);

	return fileKey;
};
