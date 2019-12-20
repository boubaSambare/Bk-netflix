const {
    Router
} = require("express");
const {
    readFile,
    writeFile
} = require("fs-extra");
const uuid = require("uuid/v1")
const {
    join
} = require("path");
const {
    check,
    sanitize,
    validationResult
} = require("express-validator");

const commentsPath = join(__dirname, "reviews.json");
const moviesPath = join(__dirname, "../movies/movies.json");

const router = Router();

const getComments = async () => {
    const buffer = await readFile(commentsPath)
    return JSON.parse(buffer.toString())
}


const getMovies = async () => {
    const buffer = await readFile(moviesPath)
    return JSON.parse(buffer.toString())
}

router.get("/:id", async (req, res) => {
        const comments = await getComments()
        const movies = await getMovies()
        const bookIdCheck = movies.find(item => item.imdbID === req.params.id)
        if (!bookIdCheck)
            return res.status(400).send('book not found')
        const filterAllcomments = comments.filter(item => item._id === req.params.id)
        let allComments = [bookIdCheck,{commentList:[...filterAllcomments]}]
        res.status(200).send(allComments)
    })

    router.post("/:id",
    [check('username').exists().withMessage(' username is required'),
    check('rate').exists().isInt({max:5}).withMessage(' username is required'),
     check('text').isLength({ min:4}).withMessage('your comment must contain at least 10 caractor')]
     , async (req, res) => {
         const errors = validationResult(req)
         if(!errors.isEmpty())
            res.status(400).send(errors)
        
        const comments = await getComments()
        const movies= await getMovies()
        const bookIdCheck = movies.find(item => item.imdbID === req.params.id)
        if (!bookIdCheck)
            return res.status(400).send('book not found')
        let newComment = {
            commentId : uuid(),
            bookId: req.params.id,
            ...req.body,
            date: new Date()
        }
        console.log("REQUEST IN",req.params.id)
        comments.push(newComment)
        await writeFile(commentsPath, JSON.stringify(comments))
        res.status(200).send('comment created')
    })

    router.delete("/:id", async (req, res) => {
        const comments = await getComments()
        const findComment = comments.find(item => item._id === req.params.id)
        if (!findComment)
            return res.status(404).send('comment not found')
        let newCommentsList = comments.filter(item => item._id !== req.params.id)
        await writeFile(commentsPath, JSON.stringify(newCommentsList))
        res.send('deleted')
    })


module.exports = router