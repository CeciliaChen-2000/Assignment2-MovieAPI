import mongoose from 'mongoose';

const Schema = mongoose.Schema;


const ReviewSchema = new Schema({
    author: { type: String },
    content: { type: String },
    created_at: { type: String },
    id: { type: String, required: true, unique: true },
    updated_at: { type: String },
    url: { type: String }
});

ReviewSchema.statics.findByReviewDBId = function (id) {
    return this.findOne({ id: id });
};

export default mongoose.model('Reviews', ReviewSchema);