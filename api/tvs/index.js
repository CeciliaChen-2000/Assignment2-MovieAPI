import tvModel from './tvModel';
import reviewModel from '../reviews/reviewModel';
import asyncHandler from 'express-async-handler';
import express from 'express';
import uniqid from 'uniqid';
import { getTVReviews } from '../tmdb-api';

const router = express.Router(); 

router.get('/', asyncHandler(async (req, res) => {
    let { page = 1, limit = 10 } = req.query; // destructure page and limit and set default values
    [page, limit] = [+page, +limit]; //trick to convert to numeric (req.query will contain string values)

    const totalDocumentsPromise = tvModel.estimatedDocumentCount(); //Kick off async calls , get the total number of documents
    const tvsPromise = tvModel.find().limit(limit).skip((page - 1) * limit);

    const totalDocuments = await totalDocumentsPromise; //wait for the above promises to be fulfilled
    const tvs = await tvsPromise;

    const returnObject = { page: page, total_pages: Math.ceil(totalDocuments / limit), total_results: totalDocuments, results: tvs };//construct return Object and insert into response object

    res.status(200).json(returnObject);
}));

// Get tv details
router.get('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const tv = await tvModel.findByTVDBId(id);
    if (tv) {
        res.status(200).json(tv);
    } else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
}));

// Get tv reviews
router.get('/:id/reviews', asyncHandler(async (req, res, next) => {
    const id = parseInt(req.params.id);
    const tv = await tvModel.findByTVDBId(id);

    //whether the tv id exists.
    if (tv) {
        //whether the tv has been loaded before
        if (tv.reviews.length){
            //load from database
            console.log("load from database");
            const localTV = await tvModel.findByTVDBId(id).populate('reviews');
            res.status(200).json(localTV.reviews);
        } else {
            //load from TMDB to database
            console.log("load from TMDB to database");
            const TMDBReviews = await getTVReviews(id);
            await reviewModel.deleteMany();
            await reviewModel.collection.insertMany(TMDBReviews);
            const review_ids = await reviewModel.find({}, { _id: 1 });
            review_ids.forEach(async review_id => {
                await tv.reviews.push(review_id)
            });
            await tv.save();
            res.status(200).json(TMDBReviews);
        }
    } else {
        res.status(404).json({ message: 'The tv id you requested could not be found.', status_code: 404 });
    }
}));

//Post a tv review
router.post('/:id/reviews', asyncHandler(async (req, res, next) => {
    const id = parseInt(req.params.id);
    const tv = await tvModel.findByTVDBId(id);

    if (tv) {
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
                await tv.reviews.push(req.body);
                await tv.save();
                res.status(201).json({code: 201, msg: 'Successful created new review.'});
            }else{
                res.status(401).json({code: 401,msg: 'Review content should be no less than 10 characters.'});
            }
        }
    } else {
        res.status(404).json({ message: 'The tv id you requested could not be found.', status_code: 404 });
    }
}));

export default router;