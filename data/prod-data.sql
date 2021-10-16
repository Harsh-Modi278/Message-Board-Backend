DROP TABLE IF EXISTS users_upvotes_boards;
DROP TABLE IF EXISTS users_downvotes_boards;
DROP TABLE IF EXISTS users_upvotes_comments;
DROP TABLE IF EXISTS users_downvotes_comments;
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
  board_name VARCHAR ( 50 ) NOT NULL,
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

-- load data
\copy users FROM '/Users/harshmodi/Downloads/users.csv' WITH (FORMAT CSV, HEADER);
\copy boards FROM '/Users/harshmodi/Downloads/boards.csv' WITH (FORMAT CSV, HEADER);
\copy comments FROM '/Users/harshmodi/Downloads/comments.csv' WITH (FORMAT CSV, HEADER);
\copy users_upvotes_boards FROM '/Users/harshmodi/Downloads/users_upvotes_boards.csv' WITH (FORMAT CSV, HEADER);
\copy users_downvotes_boards FROM '/Users/harshmodi/Downloads/users_downvotes_boards.csv' WITH (FORMAT CSV, HEADER);
\copy users_downvotes_comments FROM '/Users/harshmodi/Downloads/users_downvotes_comments.csv' WITH (FORMAT CSV, HEADER);
\copy users_upvotes_comments FROM '/Users/harshmodi/Downloads/users_upvotes_comments.csv' WITH (FORMAT CSV, HEADER);
