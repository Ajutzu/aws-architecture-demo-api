import express from "express";
import { createPost, deletePost, getPosts } from "../controllers/post.controller.js";
import contentValidator from "../middleware/content-validator.js";
import imageValidator from "../middleware/image-validator.js";
import rateLimiter from "../middleware/rate-limiter.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Post Module Routes

router.get("/", getPosts);
router.post("/", rateLimiter, upload, imageValidator, contentValidator, createPost);
router.delete("/:id", deletePost);


export default router;
