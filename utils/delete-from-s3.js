import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { appConfig } from "../config/credential-holder.js";
import { s3Client } from "../config/aws.js";

// Deletes an Object from the specified S3 bucket uisng the provided object key.

export const deleteFromS3 = async (objectKey) => {
	if (!objectKey) {
		return null;
	}

	if (!appConfig.awsBucketName) {
		const error = new Error("AWS bucket name is not configured.");
		error.statusCode = 500;
		throw error;
	}

	await s3Client.send(
		new DeleteObjectCommand({
			Bucket: appConfig.awsBucketName,
			Key: objectKey,
		})
	);

	return true;
};
