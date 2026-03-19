CREATE TABLE t_p11610192_minecraft_collapse_s.reviews (
  id SERIAL PRIMARY KEY,
  nickname VARCHAR(50) NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);