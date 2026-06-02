const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
      {
    username: "john",
    password: "pass123"
  },
  {
    username: "mary",
    password: "pass456"
  }
];
;

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    
}

const authenticatedUser = (username,password)=>{ //returns boolean
    //code to check if username and password match the one we have in records.
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Middleware to verify JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  
    if (!token) {
      return res.status(401).json({ message: "User not logged in" });
    }
  
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      req.user = user; // decoded { username: ... }
      next();
    });
  }
  

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(404).json({message: "Error logging in" });
    }
  
    if (authenticatedUser(username, password)) {
      // Generate JWT access token
      let accessToken = jwt.sign({ username }, 'access', { expiresIn: 60 * 60 });
  
      // Store access token and username in session
      req.session.authorization = { accessToken, username };
      return res.status(200).json({
        message: "User successfully logged in",
        token: accessToken
      });
    } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
  });
  

// Add a book review
regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.user.username; // ✅ from decoded JWT

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
