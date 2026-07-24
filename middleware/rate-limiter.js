// Variable for the time window in milliseconds (24 hours)

const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_DELETIONS_PER_WINDOW = 3;
const postCreationMap = new Map();
const deletionMap = new Map();
const voteMaps = {
	upvote: new Map(),
	downvote: new Map(),
};

// Creates a rate limit error with a message indicating that 
// the user can only create one post per IP address every 24 hours.

const createRateLimitError = (retryAfterSeconds) => {
	const error = new Error("You can only create one post per IP address every 24 hours.");

	error.statusCode = 429;
	error.retryAfter = retryAfterSeconds;
	error.details = {
		retryAfterSeconds,
	};

	return error;
};

// Creates a rate limit error for duplicate votes on the same post from the same IP.

const createVoteLimitError = (action) => {
	const verb = action === "downvote" ? "downvote" : "upvote";
	const error = new Error(`You can only ${verb} this post once per IP address.`);

	error.statusCode = 429;
	error.details = {
		action,
	};

	return error;
};

// Creates a rate limit error for exceeding the deletion limit per IP address.

const createDeleteLimitError = (retryAfterSeconds) => {
	const error = new Error(`You can only delete ${MAX_DELETIONS_PER_WINDOW} posts per IP address every 24 hours.`);

	error.statusCode = 429;
	error.retryAfter = retryAfterSeconds;
	error.details = {
		retryAfterSeconds,
	};

	return error;
};

// Removes expired entries from the postCreationMap and deletionMap based on the defined time window.

const pruneExpiredEntries = () => {
	const now = Date.now();

	for (const [ipAddress, timestamp] of postCreationMap.entries()) {
		if (now - timestamp >= WINDOW_MS) {
			postCreationMap.delete(ipAddress);
		}
	}

	for (const [ipAddress, deletions] of deletionMap.entries()) {
		const activeDeletions = deletions.filter((timestamp) => now - timestamp < WINDOW_MS);

		if (activeDeletions.length === 0) {
			deletionMap.delete(ipAddress);
		} else {
			deletionMap.set(ipAddress, activeDeletions);
		}
	}
};

// Records the creation time of a post for a given IP address in the postCreationMap.

export const recordPostCreation = (ipAddress) => {
	if (!ipAddress) {
		return;
	}

	postCreationMap.set(ipAddress, Date.now());
};

const getVoteMap = (action) => voteMaps[action];

const getVoteKey = (ipAddress, postId) => `${ipAddress}:${postId}`;

// Records a successful vote for a post from a given IP address.

export const recordPostVote = (action, ipAddress, postId) => {
	if (!ipAddress || !Number.isInteger(postId) || postId < 1) {
		return;
	}

	const voteMap = getVoteMap(action);

	if (!voteMap) {
		return;
	}

	voteMap.set(getVoteKey(ipAddress, postId), Date.now());
};

// Records a post deletion for a given IP address.

export const recordPostDeletion = (ipAddress) => {
	if (!ipAddress) {
		return;
	}

	if (!deletionMap.has(ipAddress)) {
		deletionMap.set(ipAddress, []);
	}

	const deletions = deletionMap.get(ipAddress);
	deletions.push(Date.now());
};

// Middleware factory that enforces one vote per IP per post for the given action.

export const createVoteLimiter = (action) => (req, res, next) => {
	const voteMap = getVoteMap(action);

	if (!voteMap) {
		return next();
	}

	const postId = Number.parseInt(req.params.id, 10);

	if (!Number.isInteger(postId) || postId < 1) {
		return next();
	}

	const voteKey = getVoteKey(req.ip, postId);

	if (voteMap.has(voteKey)) {
		return next(createVoteLimitError(action));
	}

	return next();
};

// Middleware function to enforce deletion rate limiting based on IP address.

export const createDeleteLimiter = (req, res, next) => {
	pruneExpiredEntries();

	const ipAddress = req.ip;
	const deletions = deletionMap.get(ipAddress);

	if (deletions && deletions.length >= MAX_DELETIONS_PER_WINDOW) {
		const oldestDeletion = deletions[0];
		const retryAfterMs = WINDOW_MS - (Date.now() - oldestDeletion);
		const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

		return next(createDeleteLimitError(retryAfterSeconds));
	}

	return next();
};

// Middleware function to enforce rate limiting for post creation based on IP address.

export default function rateLimiter(req, res, next) {
	pruneExpiredEntries();

	const ipAddress = req.ip;
	const lastCreatedAt = postCreationMap.get(ipAddress);

	if (lastCreatedAt) {
		const elapsedTime = Date.now() - lastCreatedAt;

		if (elapsedTime < WINDOW_MS) {
			return next(createRateLimitError(Math.ceil((WINDOW_MS - elapsedTime) / 1000)));
		}
	}

	return next();
}
