const express = require('express');
const Article = require('../models/articles')
const router = express.Router()
const cloudinary = require("../utils/cloudinary")
const upload = require( "../utils/multer")

router.get('/new', (req, res) => {
    res.render("new", { article: new Article() })
})

router.get("/edit/:id", async(req, res)=>{
    const article = await Article.findById(req.params.id);
    res.render("edit", {article: article})
})


router.get('/:slug', (req, res) => {
    Article.findOne({ slug: req.params.slug })
        .then((article) => {
            if (article) {
                res.render("show", { article: article })
            } else {
                res.redirect("/")
            }
        })
})

router.post('/new', upload.single("image"), async (req, res) => {

    try {

        const result = await cloudinary.uploader.upload(req.file.path);

        // Crear nuevo articulo
        let article = new Article({
            title: req.body.title,
            description: req.body.description,
            markdown: req.body.markdown,
            image: result.secure_url,
            cloudinary_id: result.public_id
        })

        // Guardamos en DB
        article.save();
        res.redirect("/")
    } catch (err) {
        console.log(err)
    }
})

router.put('/edit/:id', async (req, res, next) => {
    try {
        req.article = await Article.findById(req.params.id)
        next()
    } catch (err) {
        console.log(err)
    }
},
    saveArticleAndRedirect("edit")
)



router.delete("/:id", async(req, res)=>{
    try{
        let article = await Article.findById(req.params.id);

        await cloudinary.uploader.destroy(article.cloudinary_id);

        await article.deleteOne();

        res.redirect("/")
    }catch (err) {
        console.log(err)
    }
})


function saveArticleAndRedirect(path) {
    return async (req, res) => {
        let article = req.article;
        article.title = req.body.title;
        article.description = req.body.description;
        article.markdown = req.body.markdown;

        try {
            // Guardamos en DB
            article = await article.save();
            res.redirect(`/${article.slug}`)
        }catch(e){
            res.render(`/${path}`, {article: article})
        }
    }

}



module.exports = router;