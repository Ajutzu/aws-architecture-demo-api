import { S3Client } from "@aws-sdk/client-s3";
import { appConfig } from "./credential-holder.js";

// Initialie the S3 client with the provided AWS credentials and region from the appConfig.
// If the AWS access key and secret access key are not provided, the S3 clietn will use the
// default credentials provider chain to obtain the credentials.

export const s3Client = new S3Client({
  region: appConfig.awsRegion,
  ...(appConfig.awsAccessKeyId && appConfig.awsSecretAccessKey
    ? {
        credentials: {
          accessKeyId: appConfig.awsAccessKeyId,
          secretAccessKey: appConfig.awsSecretAccessKey,
        },
      }
    : {}),
});