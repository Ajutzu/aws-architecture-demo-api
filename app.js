// Express App
import express from "express";

// Express Middleware
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Configuration
import { appConfig } from "./config/credential-holder.js";
import errorHandler from "./middleware/error-handler.js";
import postRoutes from "./routes/post.route.js";

const app = express();

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

const PORT = appConfig.port;

// Middleware
app.use(helmet());
app.use(cors());
app.use(apiLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Startup Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running.",
  });
});

// Routes
app.use("/api/posts", postRoutes);

// Error Handling Middleware
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);

  error.statusCode = 404;

  return next(error);
});

app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;