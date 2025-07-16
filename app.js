require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Book = require('./models/book');

const app = express();
app.use(express.json());
const path = require("path");//path use for connent path...>
app.set("view engine", 'ejs');
app.set("views", path.join(__dirname, "views"));//pathset-up
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas
mongoose.connect(process.env.ATLASDB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Connected to MongoDB Atlas");
  insertBooks(); // Insert books only if DB is empty
}).catch(err => {
  console.error(" MongoDB connection error:", err);
});

// data of  10 books
async function insertBooks() {
  const books = [
    { title: "The Alchemist", author: "Paulo Coelho" },
    { title: "1984", author: "George Orwell" },
    { title: "To Kill a Mockingbird", author: "Harper Lee" },
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
    { title: "The Catcher in the Rye", author: "J.D. Salinger" },
    { title: "Pride and Prejudice", author: "Jane Austen" },
    { title: "The Hobbit", author: "J.R.R. Tolkien" },
    { title: "Animal Farm", author: "George Orwell" },
    { title: "Brave New World", author: "Aldous Huxley" },
    { title: "Atomic Habits", author: "James Clear" }
  ];

  const count = await Book.countDocuments();
  if (count === 0) {
    await Book.insertMany(books);
    console.log(" Inserted 10 books into database!");
  } else {
    console.log("Books already exist in the database.");
  }
}

// Routes
app.get('/book',async (req, res) => {
    const allBooks = await Book.find();
  res.render('books/index', { allBooks });

});

app.get('/order/:id', async (req, res) => {
  const bookId = req.params.id;
  const book = await Book.findById(bookId);
  
  if (!book) {
    return res.status(404).send("Book not found");
  }

  res.render('books/booked', { book });
});

const Order = require('./models/order');

//confirm-order
app.post('/confirm-order', async (req, res) => {
  const { bookId, customerName, customerPhone } = req.body;

  try {
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).send("Book not found");

    const order = new Order({
      book: bookId,
      customerName,
      customerPhone
    });

    await order.save();

    res.render('books/confirmation', {
      book,
      customerName,
      customerPhone
     
    });
 console.log(order)
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});


//  Start Server
app.listen(8080, () => {
  console.log("🚀 Server listening on http://localhost:8080/book");
});
