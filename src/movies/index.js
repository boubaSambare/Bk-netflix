const {
    Router
} = require("express");
const {
    readFile,
    writeFile,
    WriteStream,
    ReadStream
} = require("fs-extra");
const multer = require('multer')
const {
    join,
    extname
} = require("path");
const {
    check,
    sanitize,
    validationResult
} = require("express-validator");

const fetch = require('node-fetch');

const moviesPath = join(__dirname, "./movies.json");

const router = Router();


const getMovies = async () => {
    const buffer = await readFile(moviesPath)
    return JSON.parse(buffer.toString())
}


router.get("/", async (req, res, next) => {
    const allMovies = await getMovies();
    res.status(200).send(allMovies);
})

router.post("/",
    [
        check('Title').exists().withMessage('Title is required'),
        check('Year').exists().isInt().withMessage('Year is require and must be an number'),
        check('imdbID').exists().withMessage('imdbID is require '),
        check('Type').exists().withMessage('Type is required'),
        check('Poster').exists().withMessage('Poster is required')

    ], async (req, res, next) => {
        try {
            const error = validationResult(req);
            console.log(req.body)
            if (!error.isEmpty()) return res.status(500).send(error)

            const allMovies = await getMovies();

            const checkMoviesId = allMovies.find(item => item.imdbID === req.body.imdbID)
            if (checkMoviesId) return res.status(500).send('id already exist')

            allMovies.push(req.body)
            await writeFile(moviesPath, JSON.stringify(allMovies))
            res.status(201).send('created')
        } catch (error) {
            
        }

    })

    router.put("/:id", async (req, res , next) => {
        const allMovies = await getMovies();
        const checkMovies = allMovies.find(item => item.imdbID === req.params.id)
        if (!checkMovies) return res.status(500).send('media not found')
        const filterMovies = allMovies.filter(item => item.imdbID === req.body.imdbID)

        let newMoviesList = [...filterMovies, req.body]
        await writeFile(moviesPath, JSON.stringify(newMoviesList))
        res.send('updated')
    })

    router.delete("/:id", async (req, res , next) => {
        const allMovies = await getMovies();
        const checkMovies = allMovies.find(item => item.imdbID === req.params.id)
        if (!checkMovies) return res.status(500).send('media not found')
        const filterMovies = allMovies.filter(item => item.imdbID === req.body.id)
        await writeFile(moviesPath, JSON.stringify(filterMovies))
        res.send('deleted')
    })

    const multerConfig = multer({})

    router.post("/:id/upload", multerConfig.single("prodPic"), async (req, res)=>{
        const allMovies = await getMovies();
        const checkMovies = allMovies.find(item => item.imdbID === req.params.id)
        if (!checkMovies) return res.status(500).send('media not found')
        if (checkMovies)
        {
            const fileDestination = join(__dirname,"../../public/images/", req.params.id + extname(req.file.originalname))
            await writeFile(fileDestination ,req.file.buffer)
            checkMovies.Poster = "/images/" + req.params.id + extname(req.file.originalname);
            const filterMovies = allMovies.filter(item => item.imdbID === req.body.id)
            await writeFile(moviesPath,JSON.stringify( [...filterMovies, checkMovies]))
            res.send(checkMovies)
        }
        else
            res.status(404).send("Not found")
    })

    router.get("/:id", async (req, res, next) => {
        const allMovies = await getMovies();
        const checkMovies = allMovies.find(item => item.imdbID === req.params.id)
        if (!checkMovies) return res.status(500).send('media not found')
        const getOmdbMovie = await fetch(`http://www.omdbapi.com/?apikey=17d07cb2&i=${req.params.id}`)
        const resOmdbMovie = await getOmdbMovie.json()
        res.status(200).send(resOmdbMovie)
    })

module.exports = router