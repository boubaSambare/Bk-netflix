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
/**
 * 
 * get all comments
 */
router.get("/media/:id", async (req, res) => {
    const comments = await getComments()
    const movies = await getMovies()
    const movieIdCheck = movies.find(item => item.imdbID === req.params.id)
    if (!movieIdCheck )
        return res.status(400).send('book not found')
    const filterAllcomments = comments.filter(item => item.elementId === req.params.id)
    
    res.status(200).send(filterAllcomments)
})

router.post("/:id",
    [check('username').exists().withMessage(' username is required'),
        check('rate').exists().isInt({
            min: 1,
            max: 5
        }).withMessage(' rate number must be around 1 to 5'),
        check('text').isLength({
            min: 10
        }).withMessage('your comment must contain at least 10 caractor')
    ], async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) return res.status(400).send(errors)


            const movies = await getMovies()
            const comments = await getComments()
            const bookIdCheck = movies.find(item => item.imdbID === req.params.id)
            if (!bookIdCheck)
                return res.status(400).send('book not found')
            let newComment = {
                _id: uuid(),
                elementId: req.params.id,
                ...req.body,
                cerateAt: new Date()
            }
            comments.push(newComment)
            await writeFile(commentsPath, JSON.stringify(comments))
            res.status(200).send('comment created')
        } catch (error) {
            console.log(error)
        }
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

router.get("/:id", async (req, res) => {
    const comments = await getComments()
    const findComment = comments.find(item => item._id === req.params.id)
    if (!findComment)
        return res.status(404).send('comment not found')
    res.status(200).send(findComment)
})


module.exports = router