You are working on an existing Express.js REST API project.

Before making any changes:

1. Read `rules.md` and strictly follow every architectural rule inside it.
2. Read the database schema inside `db/db.sql`.
3. Follow the existing folder structure.
4. Never create duplicate files or move files unless explicitly instructed.

This project already has the following architecture:

config/
- Application configuration only.

controllers/
- Business logic only.

db/
- PostgreSQL schema and seed files.

middleware/
- Security, validation, upload restrictions, rate limiting, and error handling.

models/
- Database queries only.
- Never place SQL in controllers.

routes/
- Express endpoints only.

utils/
- Shared helper functions.

app.js
- Express initialization.

----------------------------------------

Development Rules

- Follow the architecture defined in rules.md.
- Reuse existing utilities before creating new ones.
- Never duplicate code.
- Keep controllers small.
- Models communicate with PostgreSQL.
- Routes only call controllers.
- Use parameterized SQL queries.
- Use async/await.
- Return consistent JSON responses.
- Use proper HTTP status codes.
- Keep code modular and maintainable.

----------------------------------------

When implementing a feature:

1. First inspect the existing files.
2. Modify existing code whenever possible.
3. Only create new files if absolutely necessary.
4. Explain why a new file is needed before creating it.

Never regenerate the entire project unless I explicitly ask.

Wait for my feature request before writing code.