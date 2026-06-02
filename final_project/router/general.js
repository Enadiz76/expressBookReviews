const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // Extract the isbn parameter from the request URL and parse it
  const ISBN = parseInt(req.params.isbn);
  
  //send book details based on the id else 404
  if(books[ISBN]) {
    res.json(books[ISBN]);
  }
  else {
    res.status(404).json({message: "Could not retrieve the requested book"})
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = decodeURIComponent(req.params.author).toLocaleLowerCase();
    const keys = Object.keys(books);

    //Filter books by matching author
    const matchingBooks = keys
        .map(isbn => books[isbn])
        .filter(book => book.author.toLowerCase().includes(author));
    
    if(matchingBooks){
        res.json(matchingBooks);
    }
    else {
        res.status(404).json({message: "Could not retrieve any books from that author"});
    }
   
 });

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    // decode URI component to handle spaces and special characters
    const title = decodeURIComponent(req.params.title).toLowerCase();  
    const keys = Object.keys(books);

    // filter books by matching title
    const matchingBooks = keys
        .map(isbn => books[isbn])
        .filter(book => book.title.toLowerCase().includes(title));

    if (matchingBooks.length > 0) {
        res.json(matchingBooks);
    } else {
        res.status(404).json({ message: "No books found with this title" });
    }  

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn; 

    if (books[isbn]) {
        res.json(books[isbn].reviews);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
