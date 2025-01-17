-- insert_test_data.sql

USE horror_forum;

-- Inserting sample topics
INSERT INTO topics (name) VALUES
('Ghosts & Hauntings'),
('Vampires & Werewolves'),
('Urban Legends'),
('Mystery & Suspense'),
('Sci-Fi Horrors');

-- Inserting sample users
INSERT INTO users (username, email) VALUES
('user1', 'user1@example.com'),
('user2', 'user2@example.com'),
('user3', 'user3@example.com'),
('user4', 'user4@example.com');

-- Inserting sample posts
-- Assuming each post is associated with a topic and a user
INSERT INTO posts (title, content, topic_id, user_id) VALUES
('The Haunted Mansion', 'A story about a haunted mansion with mysterious figures.', 1, 1),
('Vampire in the City', 'Urban vampire story set in modern times.', 2, 2),
('The Vanishing Hitchhiker', 'Retelling of the classic urban legend.', 3, 3),
('Mystery of the Abandoned House', 'A group of friends explore an abandoned house and uncover its secrets.', 4, 4),
('Alien Invasion', 'A tale of an alien invasion on Earth.', 5, 1);

-- Inserting sample user-topic associations
-- Assuming users need to be members of a topic to post
INSERT INTO user_topics (user_id, topic_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(1, 5),
(2, 1),
(3, 4),
(4, 2);