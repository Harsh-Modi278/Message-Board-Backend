DROP TABLE IF EXISTS rich_content;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS boards;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  user_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username VARCHAR ( 25 ) UNIQUE NOT NULL,
  email VARCHAR ( 50 ) UNIQUE NOT NULL,
  full_name VARCHAR ( 100 ) NOT NULL,
  last_login TIMESTAMP,
  created_on TIMESTAMP NOT NULL,
  imageurl VARCHAR(200)
);

CREATE TABLE boards (
  board_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  board_name VARCHAR ( 50 ) UNIQUE NOT NULL,
  board_description TEXT NOT NULL,
  time_created TIMESTAMP NOT NULL,
  upvotes INTEGER DEFAULT 1
);

CREATE TABLE comments (
  comment_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  board_id INT REFERENCES boards(board_id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  time TIMESTAMP NOT NULL,
  upvotes INTEGER DEFAULT 0
);

CREATE TABLE rich_content (
  content_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  comment_id INT REFERENCES comments(comment_id) ON DELETE CASCADE,
  content JSONB NOT NULL
);

CREATE TABLE users_upvotes_boards (
  user_id INTEGER REFERENCES users (user_id),
  board_id INTEGER REFERENCES boards (board_id),
  PRIMARY KEY (user_id, board_id)
);

CREATE TABLE users_downvotes_boards (
  user_id INTEGER REFERENCES users (user_id),
  board_id INTEGER REFERENCES boards (board_id),
  PRIMARY KEY (user_id, board_id)
);

CREATE TABLE users_upvotes_comments (
  user_id INTEGER REFERENCES users (user_id),
  comment_id INTEGER REFERENCES comments (comment_id),
  PRIMARY KEY (user_id, comment_id)
);

CREATE TABLE users_downvotes_comments (
  user_id INTEGER REFERENCES users (user_id),
  comment_id INTEGER REFERENCES comments (comment_id),
  PRIMARY KEY (user_id, comment_id)
);

INSERT INTO rich_content
  (comment_id, content)
VALUES
  (63, '{ "type": "poll", "question": "What is your favorite color?", "options": ["blue", "red", "green", "yellow"] }'),
  (358, '{ "type": "video", "url": "https://youtu.be/dQw4w9WgXcQ", "dimensions": { "height": 1080, "width": 1920 }}'),
  (358, '{ "type": "poll", "question": "Is this your favorite video?", "options": ["yes", "no", "oh you"] }'),
  (410, '{ "type": "image", "url": "https://btholt.github.io/complete-intro-to-linux-and-the-cli/WORDMARK-Small.png", "dimensions": { "height": 400, "width": 1084 }}'),
  (485, '{ "type": "image", "url": "https://btholt.github.io/complete-intro-to-linux-and-the-cli/HEADER.png", "dimensions": { "height": 237 , "width": 3301 }}');

-- load data
\copy users FROM './users.csv' WITH (FORMAT CSV);
\copy boards FROM './boards.csv' WITH (FORMAT CSV);
\copy comments FROM './comments.csv' WITH (FORMAT CSV);
\copy users_upvotes_boards FROM './users_upvotes_boards.csv' WITH (FORMAT CSV);
\copy users_downvotes_boards FROM './users_downvotes_boards.csv' WITH (FORMAT CSV);
\copy users_downvotes_comments FROM './users_downvotes_comments.csv' WITH (FORMAT CSV);
\copy users_upvotes_comments FROM './users_upvotes_comments.csv' WITH (FORMAT CSV);
