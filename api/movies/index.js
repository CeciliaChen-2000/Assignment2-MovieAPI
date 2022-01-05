import movieModel from './movieModel';
import reviewModel from '../reviews/reviewModel';
import asyncHandler from 'express-async-handler';
import express from 'express';
import uniqid from 'uniqid';
import { getUpcomingMovies, getNowPlayingMovies, getPopularMovies, getTopRatedMovies, getRecommendationMovies, getMovieReviews } from '../tmdb-api';

const router = express.Router(); 

//get all movies list
router.get('/', asyncHandler(async (req, res) => {
    let { page = 1, limit = 10 } = req.query; // destructure page and limit and set default values
    [page, limit] = [+page, +limit]; //trick to convert to numeric (req.query will contain string values)

    const totalDocumentsPromise = movieModel.estimatedDocumentCount(); //Kick off async calls , get the total number of documents
    const moviesPromise = movieModel.find().limit(limit).skip((page - 1) * limit);

    const totalDocuments = await totalDocumentsPromise; //wait for the above promises to be fulfilled
    const movies = await moviesPromise;

    const returnObject = { page: page, total_pages: Math.ceil(totalDocuments / limit), total_results: totalDocuments, results: movies };//construct return Object and insert into response object

    res.status(200).json(returnObject);
}));

// Get movie details
router.get('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const movie = await movieModel.findByMovieDBId(id);
    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
}));


// Get movie reviews
router.get('/:id/reviews', asyncHandler(async (req, res, next) => {
    const id = parseInt(req.params.id);
    const movie = await movieModel.findByMovieDBId(id);

    //whether the movie id exists.
    if (movie) {
        //whether the movie has been loaded before
        if (movie.reviews.length){
            //load from database
            console.log("load from database");
            const localMovie = await movieModel.findByMovieDBId(id).populate('reviews');
            res.status(200).json(localMovie.reviews);
        } else {
            //load from TMDB to database
            console.log("load from TMDB to database");
            const TMDBReviews = await getMovieReviews(id);
            await reviewModel.deleteMany();
            await reviewModel.collection.insertMany(TMDBReviews);
            const review_ids = await reviewModel.find({}, { _id: 1 });
            review_ids.forEach(async review_id => {
                await movie.reviews.push(review_id)
            });
            await movie.save();
            res.status(200).json(TMDBReviews);
        }
    } else {
        res.status(404).json({ message: 'The movie id you requested could not be found.', status_code: 404 });
    }
}));

//Post a movie review
router.post('/:id/reviews', asyncHandler(async (req, res, next) => {
    const id = parseInt(req.params.id);
    const movie = await movieModel.findByMovieDBId(id);

    if (movie) {
        req.body.created_at = new Date();
        req.body.updated_at = new Date();
        req.body.id = uniqid();

        if (!req.body.author || !req.body.content) {
            res.status(401).json({success: false, msg: 'Please enter your name and review content.'});
            return next();
        } else{
            let contentRegExp = /^(a-z|A-Z|0-9)*[^$%^&*;:,<>?()\""\']{10,}$/;
            if(contentRegExp.test(req.body.content)){
                await reviewModel.collection.insertOne(req.body);
                await movie.reviews.push(req.body);
                await movie.save();
                res.status(201).json({code: 201, msg: 'Successful created new review.'});
            }else{
                res.status(401).json({code: 401,msg: 'Review content should be bo less than 10 characters.'});
            }
        }
    } else {
        res.status(404).json({ message: 'The movie id you requested could not be found.', status_code: 404 });
    }
}));

//get upcoming movies
router.get('/tmdb/upcoming', asyncHandler( async(req, res) => {
    const upcomingMovies = await getUpcomingMovies();
    res.status(200).json(upcomingMovies);
}));

//get nowPlaying movies
router.get('/tmdb/nowPlaying', asyncHandler( async(req, res) => {
    const nowPlayingMovies = await getNowPlayingMovies();
    res.status(200).json(nowPlayingMovies);
}));

//get popular movies
router.get('/tmdb/popular', asyncHandler( async(req, res) => {
    const popularMovies = await getPopularMovies();
    res.status(200).json(popularMovies);
}));

//get topRated movies
router.get('/tmdb/topRated', asyncHandler( async(req, res) => {
    const topRatedMovies = await getTopRatedMovies();
    res.status(200).json(topRatedMovies);
}));

//get recommendation movies
router.get('/:id/recommendations', asyncHandler( async(req, res) => {
    const id = parseInt(req.params.id);
    const movie = await movieModel.findByMovieDBId(id);
    if(movie){
        const recommendationMovies = await getRecommendationMovies(id);
        res.status(200).json(recommendationMovies);
    } else {
        res.status(404).json({message: 'The movie id you requested could not be found.', status_code: 404});
    }
}));

export default router;