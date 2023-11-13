const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const cors = require('cors');
const mongoose = require('mongoose');

const Tweet = require('../models/tweets');
const tweetRouter = require("../routes/tweets"); 
const authRouter = require('../routes/auth');


const app = express();

require('dotenv').config();

app.set("view engine", "ejs");

app.use('/styles', express.static('styles'));
app.use('/uploads', express.static('uploads'))


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use('/', tweetRouter); // Use the tweetRouter for the root path
app.use(cors());

app.use("/public", express.static("./public"));

app.use(cookieParser());
app.use(
    session({
      secret: process.env.SESSION_SECRET || 'secret-key',
      resave: true,
      saveUninitialized: true,
    })
  );
app.use('/auth', authRouter);
  

app.get("/", async (req, res) => {
    const tweets = await Tweet.find().sort({ createdAt: "desc" }); 
    res.render("index", { tweets: tweets }); 
});


mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB Atlas Database"))
    .catch((err) => console.error(err));


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));