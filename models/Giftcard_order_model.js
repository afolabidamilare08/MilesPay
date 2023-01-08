const mongoose = require('mongoose')

const GiftcardOrderSchema = new mongoose.Schema({
    user:{ type: String, required: true, unique:false },
    Gift_card_brand: { type: Object, required: true, unique: false },
    Gift_card: { type: Object, required: true, unique: false },
    amountToreceive: { type: Number, required: true, unique: false },
    giftcard_value: { type: Number, required: true, unique: false },
    order_status: { type: String, required: true, unique: false },
    order_message: { type: String, required: false, unique: false },
    order_image:{ type: Object, required:false, unique: false }
}, {
    timestamps: true
})


const GiftcardOrder = mongoose.model("GiftcardOrder", GiftcardOrderSchema)

module.exports = GiftcardOrder