-- Create database
CREATE DATABASE post;

-- Create enum type
CREATE TYPE post_category_enum AS ENUM (
    'General',
    'Accident',
    'Crime',
    'Suspicious Activity',
    'Lost and Found',
    'Traffic',
    'Event',
    'Emergency',
    'Pervert',
    'Missing Person'
);

-- Create table
CREATE TABLE post (
    post_id SERIAL PRIMARY KEY,
    post_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    post_description TEXT NOT NULL,
    post_image VARCHAR(255),
    post_located VARCHAR(255),
    post_category post_category_enum NOT NULL DEFAULT 'General',
    post_upvote INT NOT NULL DEFAULT 0,
    post_downvote INT NOT NULL DEFAULT 0
);
