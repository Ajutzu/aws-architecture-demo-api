import express from "express";

const app = express();

const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static("."));

app.set("view engine", "ejs");
app.set("views", "./view");

// Render home page
app.get("/", (req, res) => {
  res.render("index");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});