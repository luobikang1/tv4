CREATE TABLE IF NOT EXISTS user_data (
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT,
  updatedAt INTEGER,
  PRIMARY KEY (userId, type)
);
