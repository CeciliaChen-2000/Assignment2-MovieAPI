import mongoose from 'mongoose';

const Schema = mongoose.Schema;


const TVSchema = new Schema({
    poster_path: { type: String },
    popularity: { type: Number },
    id: { type: Number, required: true, unique: true },
    backdrop_path: { type: String },
    vote_average: { type: String },
    overview: { type: String },
    first_air_date: { type: String },
    origin_country: [{ type: String }],
    genre_ids: [{ type: Number }],
    original_language: { type: String },
    vote_count: { type: Number },
    name: { type: String },
    original_name: { type: String },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reviews'
    }, { collection: 'movies' }]
});
TVSchema.statics.findByTVDBId = function (id) {
    return this.findOne({ id: id });
};
export default mongoose.model('TVs', TVSchema);