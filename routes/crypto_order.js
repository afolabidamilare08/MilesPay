const router = require("express").Router();
const {MongoDBerrorformat, Joierrorformat } = require("../err/error_edit");
const Crypto = require("../models/crypto_model");
const CryptoOrder = require("../models/crypto_order_model");
const User = require("../models/user_model");
const { validateBank, validateCryptoVerification, validateCryptoOrderVerification } = require("../validator/formsValidator");
const { VerifyUserToken, VerifyAdminToken, saveReportBugImage, FormidableVefification } = require("../validator/TokenValidator");
const cloudinary = require('cloudinary').v2;



const CalculatePriceFunction = (data) => {

    var crypto_price = data.crypto_price
    var cryptoAmount_toTrade = data.crypto_amount_received
    var dollar_price = data.dollar_price

    var price = crypto_price * cryptoAmount_toTrade

    price = price/1

    price = price * dollar_price

    return price

} 



const CalculateCryptoFunction = (data) => {

    var crypto_price = data.crypto_price
    var cryptoAmount_toTrade = data.crypto_amount_received
    var dollar_price = data.dollar_price

    var theCryptoamount = cryptoAmount_toTrade/crypto_price 

    var price = theCryptoamount * crypto_price

    price = price * dollar_price

    return { price:price, theCryptoamount:theCryptoamount  }

} 




const savePictures = async ( req,res,next ) => {

    if( !req.data.crypto_proof ){
        next()
    }

    else{

        const Images = []

        const IncomingSister = [req.data.crypto_proof]
    
        const uploadImage = async (imagetoupload) => {
    
            // Use the uploaded file's name as the asset's public ID and 
            // allow overwriting the asset with new versions
            const options = {
              use_filename: true,
              unique_filename: false,
              overwrite: true, 
              folder:'Crypto_order'
            };
        
            try {
              // Upload the image
              const result = await cloudinary.uploader.upload(imagetoupload, options);
              console.log(result.url);
              return result;
            } catch (error) {
              console.error(error);
              return error;
            }
        };
    
        const Forloop = async () => {
            
            for (let i = 0; i < IncomingSister.length; i++) {
    
                var image = IncomingSister[i]
                
                const result = await uploadImage(image.filepath)
                Images.push(result)
            
            }
    
            return Images
        }
    
        const NewIMages = await Forloop()
    
        req.Images = [...NewIMages]
        next()

    }

}


const DeleteUploadedImage = (data) => {

    if (data) {
        for (let k = 0; k < data.length; k++) {
            cloudinary.uploader.destroy(data[k].public_id)
        }
    }

}


router.post('/tease_order', VerifyUserToken, async (req,res) => {

    const { error, value } = validateCryptoOrderVerification(req.body)

    if (error) {
        return res.status(400).json(Joierrorformat(error.details[0]))
    }


    Crypto.findOne({"_id":value.crypto_id})
        .then( (Thecrypto) => {

            const AmountToRecieve = CalculatePriceFunction({
                crypto_price: Thecrypto.crypto_init_price_per_one,
                crypto_amount_received: value.crypto_amount_received,
                dollar_price: Thecrypto.crypto_resell_dollar_price
            })

            return res.status(200).json({
                crypto_details:Thecrypto._doc,
                amount_to_receive_Innaira: AmountToRecieve,
                crypto_wallet_type:value.crypto_wallet_type,
                crypto_amount_received:value.crypto_amount_received
            })

        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )
    
} )






router.post('/tease2nd_order', VerifyUserToken, async (req,res) => {

    const { error, value } = validateCryptoOrderVerification(req.body)

    if (error) {
        return res.status(400).json(Joierrorformat(error.details[0]))
    }


    Crypto.findOne({"_id":value.crypto_id})
        .then( (Thecrypto) => {

            const AmountToRecieve = CalculateCryptoFunction({
                crypto_price: Thecrypto.crypto_init_price_per_one,
                crypto_amount_received: value.crypto_amount_received,
                dollar_price: Thecrypto.crypto_resell_dollar_price
            })

            return res.status(200).json({
                crypto_details:Thecrypto._doc,
                amount_to_receive_Innaira: AmountToRecieve.price,
                crypto_wallet_type:value.crypto_wallet_type,
                crypto_amount_received:CalculateCryptoFunction.theCryptoamount
            })

        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )
    
} )







router.post('/add_order', VerifyUserToken, FormidableVefification, savePictures, async (req,res) => {

    const { error, value } = validateCryptoOrderVerification(req.data)

    if (error) {
        DeleteUploadedImage(req.Images) 
        return res.status(400).json(Joierrorformat(error.details[0]))
    }


    Crypto.findOne({"_id":value.crypto_id})
        .then( (Thecrypto) => {

            const AmountToRecieve = CalculatePriceFunction({
                crypto_price: Thecrypto.crypto_init_price_per_one,
                crypto_amount_received: value.crypto_amount_received,
                dollar_price: Thecrypto.crypto_resell_dollar_price
            })

            const crypto_details = Thecrypto._doc
            const crypto_amount_received = value.crypto_amount_received
            const crypto_wallet_type = value.crypto_wallet_type
            const crypto_total_price = AmountToRecieve
            const crypto_transaction_details = `Transfered ${Thecrypto.crypto_symbol}`
            const order_status = "Pending"
            const crypto_payment_proof = req.Images ? req.Images.length > 0 ? req.Images[0] : null : null
            const user_id = req.user._id

            const newCryptoOrder = new CryptoOrder({
                crypto_details,
                crypto_amount_received,
                crypto_wallet_type,
                crypto_total_price,
                crypto_transaction_details,
                order_status,
                crypto_payment_proof,
                user_id
            })
            
            newCryptoOrder.save()
                .then( (orderCrypto) => {

                    return res.status(201).json(orderCrypto)

                } )
                .catch( err => {
                    let server_error_message = MongoDBerrorformat(err)
                    DeleteUploadedImage(req.Images) 
                    return res.status(403).json({
                        error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                        special_message:null
                    })
                } )

        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err)
            DeleteUploadedImage(req.Images) 
            console.log(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } ) 
    

} )

router.get('/my_crypto_orders', VerifyUserToken, async (req,res) => {

    CryptoOrder.find({
        user_id:req.user._id
    }).sort({ _id: -1 })
        .then( (MyOrders) => {
            return res.status(200).json(MyOrders)
        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )

} )

router.put('/crypto_order_edit/:id', VerifyAdminToken, async (req,res) => {

    if ( !req.body.status ) {
        return res.status(403).json({
            error_message: "Order Status is required" ,
            special_message:null
        })
    }

    CryptoOrder.findOneAndUpdate({"_id":req.params.id},
        { $set: {
            order_status: req.body.status
        } },
        { new: true }    
    )
        .then( (MyCryptoOrder) => {

            if ( MyCryptoOrder.order_status === 'Success' ) {
                
                User.findOneAndUpdate({"_id":req.user._id},{
                    $set: {
                        wallet_balance: req.user.wallet_balance + MyCryptoOrder.crypto_total_price
                    }
                },{ new: true })
                    .then( (userUp) => {
                        return res.status(200).json(MyCryptoOrder)
                    } )
                    .catch( err => {
                        let server_error_message = MongoDBerrorformat(err)
                        return res.status(403).json({
                            error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                            special_message:null
                        })
                    } )

            }

            else{
                return res.status(202).json(MyCryptoOrder)
            }

        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )

} )

router.get('/crypto_order_detail/:id', VerifyAdminToken, async (req,res) => {

    CryptoOrder.findOne({"_id":req.params.id})
        .then( (Order) => {
            return res.status(200).json(Order)
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

