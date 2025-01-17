module.exports = function(app, forumData) {
    // handle our routes
    app.get('/', function(req, res) {
        res.render('index.ejs' , {forumName: forumData.forumName});
    });
    app.get('/about', function(req, res) {
        res.render('about.ejs', {forumName: forumData.forumName});
    });
    // lists posts route
    app.get('/posts', function(req, res) {
        db.query('SELECT * FROM posts', function(err, result) {
            if (err) throw err;
            res.render('posts.ejs', {forumName: forumData.forumName, posts: result});
        });
    });
    app.get('/topics', (req, res) => {
        // Fetch topics from the database
        db.query('SELECT * FROM topics', (err, topics) => {
            if (err) {
                // handle error
                res.send('Error fetching topics');
            } else {
                // Render the topics page with the topics data
                res.render('topics.ejs', { topics: topics });
            }
        });
    });
    app.get('/users', (req, res) => {
        // Fetch users from your database
        db.query('SELECT * FROM users', (err, users) => {
            if (err) {
                // handle error
                res.send('Error fetching users');
            } else {
                // Render the users page with the users data
                res.render('users', { users: users });
            }
        });
    });
    app.get('/posts', (req, res) => {
        // Fetch posts from your database
        db.query('SELECT * FROM posts', (err, posts) => {
            if (err) {
                // handle error
                res.send('Error fetching posts');
            } else {
                // Render the posts page with the posts data
                res.render('posts', { posts: posts });
            }
        });
    });
    app.get('/topics/:id', (req, res) => {
        const topicId = req.params.id;
    
        const query = `
            SELECT posts.id, posts.title, posts.content, users.username, topics.name as topic_name 
            FROM posts 
            JOIN users ON posts.user_id = users.id 
            JOIN topics ON posts.topic_id = topics.id
            WHERE posts.topic_id = ?`;  // Changed from posts.id to posts.topic_id
    
        db.query(query, [topicId], (err, results) => {
            if (err) {
                console.log(err);
                res.send('Error fetching post');
            } else {
                res.render('topicPosts.ejs', { posts: results });
            }
        });
    });
    app.get('/search', (req, res) => {
        const query = req.query.query;
    
        if (!query) {
            // Render the search page without results
            return res.render('search', { results: undefined });
        }
    
        // Construct your SQL query for searching
        const sqlQuery = 'SELECT * FROM posts WHERE title LIKE ? OR content LIKE ?';
        const searchPattern = `%${query}%`;
    
        db.query(sqlQuery, [searchPattern, searchPattern], (err, results) => {
            if (err) {
                // Handle the error
                console.error(err);
                res.send('Error performing the search');
            } else {
                // Render the search page with results
                res.render('search', { results: results, query: query });
            }
        });
    });
    const getTopics = (callback) => {
        db.query('SELECT * FROM topics', (err, results) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results);
            }
        });
    };
    app.get('/addPost', (req, res) => {
        // Fetch topics for the dropdown in the form, assuming you have topics in your forum
        db.query('SELECT * FROM topics', (err, topics) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error fetching topics');
            }
    
            // Render the addPost form with topics data
            res.render('addPost', { topics: topics });
        });
    });
    
    app.post('/addPost', (req, res) => {
        const { username, email, title, content, topicId } = req.body;  // Including email in the form submission
    
        // First, check if the user exists in the database
        const userQuery = 'SELECT id FROM users WHERE username = ?';
        db.query(userQuery, [username], (err, users) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error processing your request');
            }
    
            if (users.length === 0) {
                // User does not exist, add them to the database with username and email
                const newUserQuery = 'INSERT INTO users (username, email) VALUES (?, ?)';
                db.query(newUserQuery, [username, email], (newUserErr, newUserResult) => {
                    if (newUserErr) {
                        console.error(newUserErr);
                        return res.status(500).send('Error adding new user');
                    }
                    // Continue to add the post with the new user's ID
                    addPostToDatabase(newUserResult.insertId);
                });
            } else {
                // User exists, proceed to add the post with the existing user's ID
                addPostToDatabase(users[0].id);
            }
        });
    
        function addPostToDatabase(userId) {
            // Insert the new post using the user ID
            const insertQuery = 'INSERT INTO posts (title, content, user_id, topic_id) VALUES (?, ?, ?, ?)';
            db.query(insertQuery, [title, content, userId, topicId], (insertErr, insertResults) => {
                if (insertErr) {
                    console.error(insertErr);
                    return res.status(500).send('Error posting your content');
                }
                
                // Fetch the added post along with user and topic details
                const addedPostQuery = `
                    SELECT posts.*, users.username, topics.name as topic_name 
                    FROM posts 
                    JOIN users ON posts.user_id = users.id 
                    JOIN topics ON posts.topic_id = topics.id
                    WHERE posts.id = LAST_INSERT_ID()`;

                db.query(addedPostQuery, (err, results) => {
                    if (err || results.length === 0) {
                        console.error(err || 'No post found');
                        return res.status(500).send('Error retrieving the added post');
                    }

                    // Redirect to postAdded page with the post details
                    res.render('postAdded', { post: results[0], user: {username: username}, topic: {name: topicId} });
                });
            });
        }
    });

}