import express from "express";

const app = express();

const PORT = 3000;

// Middleware
app.use(express.json());

// Single endpoint
app.get("/", (req, res) => {
  res.json({
    message: "API is running"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});