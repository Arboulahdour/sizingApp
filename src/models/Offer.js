const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            unique: true,
            required: true,
        },
        overview: {
            type: String,
            unique: true,
            required: true,
        },
        link: {
            type: String,
            unique: true,
            required: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('offer', offerSchema);