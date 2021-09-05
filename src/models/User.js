const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            min: 3,
            max: 300,
            unique: true,
            required: true,
        },
        email: {
            type: String,
            max: 50,
            unique: true,
            required: true,
        },
        password: {
            type: String,
        },
        firstname: {
            type: String,
        },
        lastname: {
            type: String,
        },
        profilePicture: {
            type: String,
            default: "",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        googleId: {
            type: String,
        },
        provider: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);