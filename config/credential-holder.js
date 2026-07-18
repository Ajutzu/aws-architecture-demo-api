import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

// Helper function to parse integer values from environment variables with a fallback

const parseInteger = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

// Application configuration object containing environment variables and defaults

const appConfig = {
  port: parseInteger(process.env.PORT, 3000),
  dbHost: process.env.DB_HOST || "localhost",
  dbPort: parseInteger(process.env.DB_PORT, 5432),
  dbUser: process.env.DB_USER || "postgres",
  dbPassword: process.env.DB_PASSWORD || "",
  dbName: process.env.DB_NAME || "post",
  awsRegion: process.env.AWS_REGION || "us-east-1",
  awsBucketName: process.env.AWS_BUCKET_NAME || "",
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  cloudFrontUrl: process.env.CLOUDFRONT_URL || "",
};

// Create a PostgreSQL connection pool using the configuration

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
    }
  : {
      host: appConfig.dbHost,
      port: appConfig.dbPort,
      user: appConfig.dbUser,
      password: appConfig.dbPassword,
      database: appConfig.dbName,
    };

const pool = new Pool({
  ...poolConfig,
  max: 10,
  ssl: {
    ca: fs.readFileSync("../global-bundle.pem", "utf8"),
    rejectUnauthorized: true,
  },
});

// Define an array of valid post categories for the application

const postCategories = [
  "General",
  "Accident",
  "Crime",
  "Suspicious Activity",
  "Lost and Found",
  "Traffic",
  "Event",
  "Emergency",
  "Pervert",
  "Missing Person",
];

export { appConfig, pool, postCategories };
