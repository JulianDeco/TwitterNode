const express = require('express');
const Tweet = require('../models/tweets'); // Assuming you have a Tweet model
const router = express.Router();
const upload = require('../utils/multer');
const session = require('express-session');

require('dotenv').config()

router.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: true,
    saveUninitialized: true,
  }));

router.use('/uploads', express.static('uploads'));

router.get('/new', (req, res) => {
    res.render("tweet", { tweet: new Tweet() });
});

router.get("/edit/:id", async (req, res) => {
    const tweet = await Tweet.findById(req.params.id);
    res.render("edit", { tweet: tweet });
});

router.get('/:slug', (req, res) => {
    console.log(req.params)
    Tweet.findOne({ slug: req.params.slug })
        .then((tweet) => {
            if (tweet) {
                res.render("show", { tweet: tweet });
            } else {
                res.redirect("/");
            }
        });
});

router.post('/new', upload.single('image'), async (req, res) => {
    try {
        console.log(req.file);
        const username = req.session.user
        
        let imagePath = '';
        if (req.file) {
          imagePath = 'uploads/' + req.file.filename;
        }
    
        let tweet = new Tweet({
          content: req.body.content,
          imagePath: imagePath,
          owner: username
        });
    
        await tweet.save();
        res.redirect("/");
      } catch (err) {
        console.log(err);
        res.redirect("/new");
      }
    });

router.put('/edit/:id', upload.single('image'),  async (req, res, next) => {
    try {
        let imagePath = '';
        if (req.file) {
          imagePath = 'uploads/' + req.file.filename;
        }
        req.tweet = await Tweet.findById(req.params.id);
        const content = req.body.content
        req.session.contentToSave = content;
        req.session.imagePath = imagePath
        next();
    } catch (err) {
        console.log(err);
    }
}, saveTweetAndRedirect("edit"));

router.delete("/:id", async (req, res) => {
    try {
        let tweet = await Tweet.findById(req.params.id);

        await tweet.deleteOne();

        res.redirect("/");
    } catch (err) {
        console.log(err);
    }
});

function saveTweetAndRedirect(path) {
    return async (req, res) => {
        let tweet = req.tweet;
        console.log(req.session.contentToSave)
        tweet.content = req.session.contentToSave;
        tweet.imagePath = req.session.imagePath;

        try {
            tweet = await tweet.save();
            res.redirect(`/${tweet.slug}`);
        } catch (e) {
            console.log(e)
            res.render(`/${path}`, { tweet: tweet });
        }
    };
}



module.exports = router;