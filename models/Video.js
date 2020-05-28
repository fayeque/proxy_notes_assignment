const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoSchema = mongoose.Schema({
    writer: {
        type:Schema.Types.ObjectId,
        ref: 'User'
    },
    filePath : {
        type: String,
    }
}, { timestamps: true })


const Video = mongoose.model('Video', videoSchema);

module.exports = { Video }