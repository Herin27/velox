const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const app = express();
const fs = require('fs');
const session = require("express-session");

const Sequelize = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const port = 2000;

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'tiger',
    database: 'velox_db',
    port: 3306,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve Static Files (HTML, CSS, JS)
app.use(express.static('public'));

// Connect to the database
db.connect((err) => {
    if (err) throw err;
    console.log('Database connected!');
});

// Check if username already exists
app.post('/check-username', (req, res) => {
    const { username } = req.body;
    
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    });
});

// Registration Route
// Check if username already exists
app.post('/check-username', (req, res) => {
    const { username } = req.body;
    
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    });
});

app.post('/admin', (req, res) => {
    res.redirect('./public/admin.html');


});

// Registration Route
app.post('/register', (req, res) => {
    const { username, email, role, password } = req.body;

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) throw err;

        // Check if username already exists
        const query = 'SELECT * FROM users WHERE username = ?';
        db.query(query, [username], (err, results) => {
            if (err) throw err;

            if (results.length > 0) {
                // Return error response if username exists
                return res.send(`
                    <script>
                        document.body.innerHTML = '<div class="error-message">Username already exists! Try something else. Suggested: ${username}_123</div>';
                        setTimeout(() => {
                            window.location.href = '/register.html';  // Reload registration page
                        }, 3000);
                    </script>
                `);
            } else {
                // Insert user into the database
                const insertQuery = 'INSERT INTO users (username, email, role, password, day) VALUES (?, ?, ?, ?, ?)';
                db.query(insertQuery, [username, email, role, hashedPassword, 'ta'], (err, result) => {
                    if (err) throw err;

                    // Redirect to the login page after successful registration
                    res.redirect('/login.html');
                });
            }
        });
    });
});
// Login Route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Query to find the user by username
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            const user = results[0];

            // Compare the hashed password
            bcrypt.compare(password, user.password, (err, match) => {
                if (err) throw err;

                if (match) {
                    // Send back user data if login is successful
                    res.json({ success: true, user: { username: user.username, email: user.email } });
                } else {
                    res.json({ success: false });
                }
            });
        } else {
            res.json({ success: false });
        }
    });
});

// Configure Multer for image upload
const storage = multer.diskStorage({
    destination: "public/uploads",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });
  
  // Serve static files from the 'public' folder
  app.use(express.static('public'));
  
  // Route for uploading slider images
  app.post('/add-slider', upload.single('image'), (req, res) => {
    if (!req.file) {
        console.error("File not uploaded");
        return res.status(400).send("No file uploaded");
    }

    const { title, description } = req.body;
    const imagePath = `/uploads/${req.file.filename}`;

    db.query('INSERT INTO sliders (title, description, image_url) VALUES (?, ?, ?)', [title, description, imagePath], (err, results) => {
        if (err) {
            console.error("Database Insertion Error:", err);
            return res.status(500).send("Error saving slider");
        }
        res.sendFile(path.join(__dirname, 'public', './public/deshboard.html'));
    });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Route to fetch slider items for deshboard.html
app.get("/get-sliders", (req, res) => {
    db.query("SELECT * FROM sliders", (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error fetching sliders.");
        } else {
            res.json(results);
        }
    });
});



// Delete a slider
app.delete('/delete-slider/:id', (req, res) => {
    const { id } = req.params;

    // Query to delete the slider from the database
    db.query('DELETE FROM sliders WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Failed to delete slider");
        }
        res.sendStatus(200); // Respond with a success status
    });
});

//edit slider



app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', './public/deshboard.html'));
});

// Route to add a work item
app.post('/add-work', upload.single('image'), (req, res) => {
    const { title, description, website_url } = req.body;
    const image_path = req.file ? req.file.filename : null;

    db.query(
        'INSERT INTO completed_work (title, description, image_path, website_url) VALUES (?, ?, ?, ?)',
        [title, description, image_path, website_url],
        (error, results) => {
            if (error) throw error;
            res.redirect('/admin'); // Redirect to admin page after successful addition
        }
    );
});

app.get('/api/work-items', (req, res) => {
    db.query('SELECT * FROM completed_work', (error, results) => {
        if (error) throw error;
        res.json(results); // Send data in JSON format
    });
});

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint to delete a work item
app.delete('/api/delete-work-item/:id', (req, res) => {
    const { id } = req.params;

    // First, fetch the image path associated with the work item
    db.query('SELECT image_path FROM completed_work WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).send('Error fetching work item');
        }

        if (results.length === 0) {
            return res.status(404).send('Work item not found');
        }

        const imagePath = results[0].image_path;
        if (imagePath) {
            const imageFilePath = path.join(__dirname, 'uploads', imagePath);

            // Check if the file exists before attempting to delete
            fs.exists(imageFilePath, (exists) => {
                if (exists) {
                    fs.unlink(imageFilePath, (err) => {
                        if (err) {
                            console.error('Error deleting image:', err);
                        } else {
                            console.log('Image deleted successfully');
                        }
                    });
                } else {
                    console.log('Image file not found:', imageFilePath);
                }
            });
        }

        // Now, delete the work item from the database
        db.query('DELETE FROM completed_work WHERE id = ?', [id], (err, results) => {
            if (err) {
                return res.status(500).send('Error deleting work item from database');
            }

            res.status(200).send('Work item deleted successfully');
        });
    });
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(multer({ dest: 'uploads/' }).single('file'));



//Email send

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Render the contact form
app.get('/contact', (req, res) => {
    res.sendFile(__dirname + '/contact.html');
});

// Handle form submission and send the email
app.post('/send-email', (req, res) => {
    const userEmail = req.body.email; // Sender's email from the form
    const userMessage = "your service is very useful or impresive"; // User's message from the form
    const message = 'thank you for your feedback';

    // Create a transporter using Gmail's SMTP server
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'herin7151@gmail.com', // Your Gmail address
            pass: 'saqs bgro qtgk wlxh', // Your generated app-specific password
        },
    });

    // Set up the email options
    const mailOptions = {
        from: 'herin7151@gmail.com', // Your email (as the actual sender)
        to: `${userEmail}`, // Your email (you’re the receiver)
        subject: 'Message from Website Form',
        text: `You received a new message from: ${userEmail}\n\nMessage:\n ${message}`, // Include user's email and message in the email body
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error:', error);
            // res.send('Error sending email');
            alert("Error sending email");
        } else {
            console.log('Email sent: ' + info.response);
            // res.send('Email sent successfully!');
            alert("'Email sent successfully!");
        }
    });


    const mymailOptions = {
        from: `${userEmail}`, // Your email (as the actual sender)
        to: 'herin7151@gmail.com', // Your email (you’re the receiver)
        subject: 'Message from Website Form',
        text: `You received a new message from: ${userEmail}\n\nMessage:\n ${userMessage}`, // Include user's email and message in the email body
    };

    // Send the email
    transporter.sendMail(mymailOptions, (error, info) => {
        if (error) {
            console.log('Error:', error);
            // res.send('Error sending email');
            alert("Error sending email");
        } else {
            console.log('Email sent: ' + info.response);
            // res.send('your message send successfully');
            alert("your message send successfully");
        }
    });
});

//admin

// API route to get the user count
app.get('/api/user-count', (req, res) => {
    const query = 'SELECT COUNT(*) AS userCount FROM users';

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching user count' });
        }
        res.json({ userCount: results[0].userCount });
    });
});

app.get('/api/recent-users', (req, res) => {
    const query = 'SELECT name, email, password, created_at FROM users ORDER BY created_at DESC LIMIT 6';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching recent users:', err);
            return res.status(500).json({ error: 'Error fetching recent users' });
        }
        res.json(results); // Send the fetched users as a JSON response
    });
});

// // Get all users
// app.get('/get-users', (req, res) => {
//     const query = 'SELECT id, username, email, role, day, created_at FROM users';
//     db.query(query, (err, results) => {
//         if (err) {
//             console.error('Error fetching users:', err);
//             return res.status(500).json({ success: false, message: 'Error fetching users' });
//         }
//         res.json({ users: results });
//     });
// });

app.post('/add-user', (req, res) => {
    const { username, email, role, password, day } = req.body;

    // Validate the incoming data
    if (!username || !email || !role || !password || !day) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Insert query to add new user
    const query = `INSERT INTO users (username, email, role, password, day, created_at) 
                   VALUES (?, ?, ?, ?, ?, NOW())`;

    db.query(query, [username, email, role, password, day], (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).json({ message: 'Failed to add user' });
        }

        // Send success response
        res.status(200).json({ message: 'User added successfully' });
    });
});

// Delete a user
app.delete('/delete-user/:id', (req, res) => {
    const userId = req.params.id;
    const query = 'DELETE FROM users WHERE id = ?';

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ success: false, message: 'Error deleting user' });
        }
        res.json({ success: true, message: 'User deleted successfully' });
    });
});

// Route to get all content
app.get('/get-content', (req, res) => {
    db.query('SELECT * FROM content ORDER BY created_at DESC', (err, results) => {
        if (err) {
            console.error('Error fetching content:', err);
            res.status(500).send('Error fetching content');
            return;
        }
        res.json(results);
    });
});

// Route to add new content
app.post('/add-content', (req, res) => {
    const { title, body } = req.body;
    const sql = 'INSERT INTO content (title, body, created_at) VALUES (?, ?, NOW())';
    db.query(sql, [title, body], (err, result) => {
        if (err) {
            console.error('Error adding content:', err);
            res.status(500).send('Error adding content');
            return;
        }
        res.json({ success: true, id: result.insertId });
    });
});

// Route to edit content
app.put('/edit-content/:id', (req, res) => {
    const contentId = req.params.id;
    const { title, body } = req.body;
    const sql = 'UPDATE content SET title = ?, body = ? WHERE id = ?';
    db.query(sql, [title, body, contentId], (err, result) => {
        if (err) {
            console.error('Error editing content:', err);
            res.status(500).send('Error editing content');
            return;
        }
        res.json({ success: true });
    });
});

// Route to delete content
app.delete('/delete-content/:id', (req, res) => {
    const contentId = req.params.id;
    const sql = 'DELETE FROM content WHERE id = ?';
    db.query(sql, [contentId], (err, result) => {
        if (err) {
            console.error('Error deleting content:', err);
            res.status(500).send('Error deleting content');
            return;
        }
        res.json({ success: true });
    });
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));

// Serve static files (e.g., CSS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Render profile page
app.get('/profile', (req, res) => {
    if (req.session.userId) {
        db.query('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, results) => {
            if (err) throw err;
            const user = results[0];
            res.sendFile(path.join(__dirname, 'views', 'profile.html'));
        });
    } else {
        res.redirect('/login');
    }
});

// Update profile
app.post('/update-profile', (req, res) => {
    const { name, email, phone } = req.body;
    const userId = req.session.userId;

    db.query('UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?', [name, email, phone, userId], (err, result) => {
        if (err) throw err;
        res.redirect('/profile');
    });
});



// Start the server
app.listen(port, () => {
    console.log(`server running on port ${port}`);
});
