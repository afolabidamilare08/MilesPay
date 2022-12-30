const mongoose = require('mongoose')

const CryptoSchema = new mongoose.Schema({
    crypto_name: { type: String, required: true, unique: true },
    crypto_address: { type: String, required: true, unique: true },
    crypto_init_price_per_one: { type: Number, required: true },
    crypto_resell_dollar_price:{type: Number, required: true},
    crypto_symbol:{ type: String, required:true }
}, {
    timestamps: true
})


const Crypto = mongoose.model("Crypto", CryptoSchema)

module.exports = Crypto