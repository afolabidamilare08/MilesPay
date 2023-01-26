const router = require("express").Router();
const {MongoDBerrorformat, Joierrorformat } = require("../err/error_edit");
const Crypto = require("../models/crypto_model");
const { validateBank, validateCryptoVerification } = require("../validator/formsValidator");
const { VerifyUserToken, VerifyAdminToken } = require("../validator/TokenValidator");



router.get('/', async (req,res) => {

    Crypto.find().sort({ _id: -1 })
        .then( (cryptos) => {
            return res.status(200).json(cryptos)
        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )

} )

router.post('/add_crypto', VerifyAdminToken, async (req,res) => {

    const { error, value } = validateCryptoVerification(req.body)

    if (error) {
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    const crypto_name = value.crypto_name
    const crypto_address = value.crypto_address
    const crypto_init_price_per_one = value.crypto_init_price_per_one
    const crypto_resell_dollar_price = value.crypto_resell_dollar_price
    const crypto_symbol = value.crypto_symbol

    const newCrypto = new Crypto({
        crypto_name,
        crypto_address,
        crypto_init_price_per_one,
        crypto_resell_dollar_price,
        crypto_symbol
    })

    newCrypto.save()
        .then( (latestcrypto) => {

            return res.status(201).json(latestcrypto)

        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )

} )

router.put('/edit_crypto/:id', VerifyAdminToken, async (req,res) => {

    const { error, value } = validateCryptoVerification(req.body)

    if (error) {
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    const crypto_name = value.crypto_name
    const crypto_address = value.crypto_address
    const crypto_init_price_per_one = value.crypto_init_price_per_one
    const crypto_resell_dollar_price = value.crypto_resell_dollar_price
    const crypto_symbol = value.crypto_symbol


    const updateCrypto = {
        crypto_name,
        crypto_address,
        crypto_init_price_per_one,
        crypto_resell_dollar_price,
        crypto_symbol
    }

    Crypto.findOneAndUpdate({"_id":req.params.id},
            { $set : {
                ...updateCrypto
            } },
            { new: true }
        )
        .then( (Theupdatedcrypto) => {
            return res.status(200).json(Theupdatedcrypto)
        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )


} )


// gdtd

router.put('/delete_crypto/:id', VerifyAdminToken, async (req,res) => {

    Crypto.findOneAndDelete({"_id":req.params.id})
        .then( (Theupdatedcrypto) => {
            return res.status(200).json(Theupdatedcrypto)
        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )


} )

module.exports = router