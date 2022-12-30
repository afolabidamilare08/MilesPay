const mongoose = require('mongoose')

const CryptoOrderSchema = new mongoose.Schema({
    user_id:{type:String, required:true},
    crypto_details: { type: Object, required: true},
    crypto_amount_received: { type: Number, required: true},
    crypto_transaction_details: { type: String, required: true},
    crypto_wallet_type: { type: String, required: true},
    crypto_total_price: { type:Number, required:true },
    crypto_payment_proof: { type:Object, required:false },
    order_status:{ type: String, required:true, enum: ['Pending', 'Success', 'Failed'] }
}, {
    timestamps: true
})


const CryptoOrder = mongoose.model("CryptoOrder", CryptoOrderSchema)

module.exports = CryptoOrder