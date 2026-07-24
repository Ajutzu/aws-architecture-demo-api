import {
	createPost as createPostRecord,
	deletePost as deletePostRecord,
	getPostById,
	getPosts as getPostRecords,
	incrementPostDownvote,
	incrementPostUpvote,
} from "../models/post.js";
import { recordPostCreation, recordPostDeletion, recordPostVote } from "../middleware/rate-limiter.js";
import { deleteFromS3 } from "../utils/delete-from-s3.js";
import { formatDate } from "../utils/date-formater.js";
import { getImageUrl } from "../utils/image-url.js";
import { sendSuccess } from "../utils/response.js";
import { uploadToS3 } from "../utils/upload-to-s3.js";

// Helper function to create an HTTP error with a message and status code

const createHttpError = (message, statusCode) => {
	const error = new Error(message);

	error.statusCode = statusCode;

	return error;
};

// Helper function to normalize positive integer values with a fallback and maximum limit

const normalizePositiveInteger = (value, fallback, maximum) => {
	const parsedValue = Number.parseInt(value, 10);

	if (!Number.isInteger(parsedValue) || parsedValue < 1) {
		return fallback;
	}

	return Math.min(parsedValue, maximum);
};

// Helper function to format a post object for the API response

const formatPost = (post) => ({
	id: post.post_id,
	description: post.post_description,
	imageKey: post.post_image,
	imageUrl: getImageUrl(post.post_image),
	location: post.post_located,
	category: post.post_category,
	upvote: post.post_upvote,
	downvote: post.post_downvote,
	createdAt: formatDate(post.post_date),
});

// Controller function to handle the creation of a new post, 
// including image upload and database record creation

export const createPost = async (req, res, next) => {
	let uploadedImageKey;

	try {
		const validatedPost = req.validatedPost || {};

		uploadedImageKey = await uploadToS3(req.file);

		const savedPost = await createPostRecord({
			description: validatedPost.description,
			imageKey: uploadedImageKey,
			location: validatedPost.location,
			category: validatedPost.category,
		});

		recordPostCreation(req.ip);

		return sendSuccess(res, 201, "Post created successfully.", {
			post: formatPost(savedPost),
		});
	} catch (error) {
		console.error("[post.controller:createPost] Error:", error);

		if (uploadedImageKey) {
			try {
				await deleteFromS3(uploadedImageKey);
			} catch (cleanupError) {
				console.error("[post.controller:createPost] Failed to clean up uploaded image:", cleanupError);
			}
		}

		return next(error);
	}
};

// Controller function to retrieve posts with optional pagination and category filtering

export const getPosts = async (req, res, next) => {
	try {
		const page = normalizePositiveInteger(req.query.page, 1, 1000000);
		const limit = normalizePositiveInteger(req.query.limit, 10, 50);
		const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
		const categoryFilter = category && category !== "All" ? category : null;

		const { rows, total } = await getPostRecords({
			page,
			limit,
			category: categoryFilter,
		});

		return sendSuccess(
			res,
			200,
			"Posts retrieved successfully.",
			{
				posts: rows.map(formatPost),
			},
			{
				pagination: {
					page,
					limit,
					total,
					totalPages: total === 0 ? 0 : Math.ceil(total / limit),
				},
			}
		);
	} catch (error) {
		console.error("[post.controller:getPosts] Error:", error);
		return next(error);
	}
};

// Controller function to delete a post by its ID, including 
// image deletion from S3 and database record removal

export const deletePost = async (req, res, next) => {
	try {
		const postId = Number.parseInt(req.params.id, 10);

		if (!Number.isInteger(postId) || postId < 1) {
			throw createHttpError("Post ID must be a positive integer.", 400);
		}

		const existingPost = await getPostById(postId);

		if (!existingPost) {
			throw createHttpError("Post not found.", 404);
		}

		if (existingPost.post_image) {
			await deleteFromS3(existingPost.post_image);
		}

		await deletePostRecord(postId);

		recordPostDeletion(req.ip);

		return sendSuccess(res, 200, "Post deleted successfully.", {
			postId,
		});
	} catch (error) {
		console.error("[post.controller:deletePost] Error:", error);
		return next(error);
	}
};

const voteOnPost = async (req, res, next, action, incrementVote) => {
	try {
		const postId = Number.parseInt(req.params.id, 10);

		if (!Number.isInteger(postId) || postId < 1) {
			throw createHttpError("Post ID must be a positive integer.", 400);
		}

		const existingPost = await getPostById(postId);

		if (!existingPost) {
			throw createHttpError("Post not found.", 404);
		}

		const updatedPost = await incrementVote(postId);

		recordPostVote(action, req.ip, postId);

		return sendSuccess(res, 200, action === "upvote" ? "Post upvoted successfully." : "Post downvoted successfully.", {
			post: formatPost(updatedPost),
		});
	} catch (error) {
		console.error(`[post.controller:${action}Post] Error:`, error);
		return next(error);
	}
};

export const upvotePost = async (req, res, next) => voteOnPost(req, res, next, "upvote", incrementPostUpvote);

export const downvotePost = async (req, res, next) => voteOnPost(req, res, next, "downvote", incrementPostDownvote);
