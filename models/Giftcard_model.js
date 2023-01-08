const mongoose = require('mongoose')

const GiftcardSchema = new mongoose.Schema({
    Giftcard_brand: { type: String, required: true, unique: false },
    Giftcard_country: { type: String, required: false, unique: false },
    Giftcard_type: { type: String, required: false, unique: false },
    Giftcard_price_per_dollar: { type: Number, required: true, unique: false },
}, {
    timestamps: true
})


const Giftcard = mongoose.model("Giftcard", GiftcardSchema)

module.exports = Giftcard