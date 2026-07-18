import { pool } from "../config/credential-holder.js";

export const createPost = async ({ description, imageKey, location, category }) => {
	const queryResult = await pool.query(
		`
			INSERT INTO post (
				post_description,
				post_image,
				post_located,
				post_category
			)
			VALUES ($1, $2, $3, $4)
			RETURNING *
		`,
		[description, imageKey, location, category]
	);

	return queryResult.rows[0];
};

export const getPosts = async ({ page, limit, category }) => {
	const queryValues = [];
	const whereClauses = [];

	if (category) {
		queryValues.push(category);
		whereClauses.push(`post_category = $${queryValues.length}`);
	}

	const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
	const countResult = await pool.query(`SELECT COUNT(*)::INT AS total FROM post ${whereClause}`, queryValues);

	queryValues.push(limit, (page - 1) * limit);

	const postsResult = await pool.query(
		`
			SELECT *
			FROM post
			${whereClause}
			ORDER BY post_date DESC, post_id DESC
			LIMIT $${queryValues.length - 1}
			OFFSET $${queryValues.length}
		`,
		queryValues
	);

	return {
		rows: postsResult.rows,
		total: countResult.rows[0]?.total || 0,
	};
};

export const getPostById = async (postId) => {
	const queryResult = await pool.query(
		`
			SELECT *
			FROM post
			WHERE post_id = $1
		`,
		[postId]
	);

	return queryResult.rows[0] || null;
};

export const deletePost = async (postId) => {
	const queryResult = await pool.query(
		`
			DELETE FROM post
			WHERE post_id = $1
		`,
		[postId]
	);

	return queryResult.rowCount;
};
