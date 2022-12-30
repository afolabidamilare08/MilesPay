const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({

    full_name: { type: String, required: true, },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    transaction_pin:{type: String, required: false},
    phone_number: { type: String, required: true, unique: true },
    profile_image: { type: Object},
    wallet_balance: { type: Number, default: 0 },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
})


const User = mongoose.model("User", UserSchema)

module.exports = User