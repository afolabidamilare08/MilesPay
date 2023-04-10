const router = require("express").Router();
const {MongoDBerrorformat, Joierrorformat } = require("../err/error_edit");
const Gbrand = require("../models/Gbrand_model");
const Giftcard = require("../models/Giftcard_model");
const GiftcardOrder = require("../models/Giftcard_order_model");
const User = require("../models/user_model");
const { validateGbrandVerification, validateGiftcardVerification, validateGiftOrderVerification } = require("../validator/formsValidator");
const { VerifyAdminToken, FormidableVefification, VerifyUserToken } = require("../validator/TokenValidator");
const cloudinary = require('cloudinary').v2;



const savePictures = async ( req,res,next ) => {

    if( !req.data.order_image ){
        next()
    }

    else{

        const Images = []

        const IncomingSister = [req.data.order_image]
    
        const uploadImage = async (imagetoupload) => {
    
            // Use the uploaded file's name as the asset's public ID and 
            // allow overwriting the asset with new versions
            const options = {
              use_filename: true,
              unique_filename: false,
              overwrite: true, 
              folder:'gift_card_order'
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


router.post('/tease_giftOrder', async (req,res) => {

    const { error, value } = validateGiftOrderVerification(req.body)

    if (error) {
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    Giftcard.findOne({
        "Giftcard_brand":value.Giftcard_brand,
        "Giftcard_country":value.Giftcard_country ? value.Giftcard_country !== '' ? value.Giftcard_country : null : null,
        "Giftcard_type": value.Giftcard_type 
      }).then( (thegiftcard) => {
            return res.status(200).json({
                ...thegiftcard._doc,
                amountToreceive: value.Giftcard_amount * thegiftcard.Giftcard_price_per_dollar,
                giftcard_value: value.Giftcard_amount
            })
        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err,"Giftcard")
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )


} )


router.post('/place_giftOrder', VerifyUserToken, FormidableVefification, savePictures, async (req,res) => {

    const { error, value } = validateGiftOrderVerification(req.data)

    if (error) {
        DeleteUploadedImage(req.Images) 
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    Gbrand.findOne({"_id":value.Giftcard_brand})
        .then( (thebrand) => { 

            Giftcard.findOne({
                "Giftcard_brand":value.Giftcard_brand,
                "Giftcard_country":value.Giftcard_country ? value.Giftcard_country !== '' ? value.Giftcard_country : null : null,
                "Giftcard_type": value.Giftcard_type 
              })
            .then( (thegiftcard) => {

                    const user = req.user._id
                    const Gift_card_brand = thebrand._doc
                    const Gift_card = thegiftcard
                    const amountToreceive = value.Giftcard_amount * thegiftcard.Giftcard_price_per_dollar
                    const giftcard_value = value.Giftcard_amount
                    const order_status = "Pending"
                    const order_message = `Trading ${thebrand._doc.Gbrand_name} Giftcard`
                    const order_image = req.Images ? req.Images.length > 0 ? req.Images[0] : null : null

                    const newGiftOrder = new GiftcardOrder({
                        user,
                        Gift_card_brand,
                        Gift_card,
                        amountToreceive,
                        giftcard_value,
                        order_status,
                        order_message,
                        order_image
                    })

                newGiftOrder.save()
                .then( (savedorder) => {
                    return res.status(200).json(savedorder)
                } )
                .catch( err => {
                    let server_error_message = MongoDBerrorformat(err,"Giftcard")
                    DeleteUploadedImage(req.Images) 
                    return res.status(403).json({
                        error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                        special_message:null
                    })
                } )

            } )
            .catch( err => {
                let server_error_message = MongoDBerrorformat(err,"Giftcard")
                DeleteUploadedImage(req.Images) 
                return res.status(403).json({
                    error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                    special_message:null
                })
            } )            
 
        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err,"Giftcards")
            DeleteUploadedImage(req.Images) 
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )
} )


router.get('/all_myorders', VerifyUserToken, async (req,res) => {

    GiftcardOrder.find({"user":req.user._id})
        .then( (myorders) => {
            return res.status(200).json(myorders)
        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err,"Giftcard")
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )

} )

router.get('/all_gift_orders', VerifyAdminToken, async (req,res) => {

    GiftcardOrder.find().sort({ _id: -1 })
        .then( (myorders) => {
            return res.status(200).json(myorders)
        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err,"Giftcard")
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )

} )

router.get('/gift_order/:id', VerifyUserToken, async ( req, res ) => {

    GiftcardOrder.findOne({"_id":req.params.id})
        .then( ( (GiftOrder) => {
            return res.status(200).json(GiftOrder)
        } ) )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err,"Giftcard")
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )

} )


router.put('/gift_order_edit/:id', VerifyAdminToken, async ( req, res ) => {

    if ( !req.body.status ) {
        return res.status(403).json({
            error_message: "Order Status is required" ,
            special_message:null
        })
    }

    GiftcardOrder.findOneAndUpdate({"_id":req.params.id},{
        $set:{
            order_status:req.body.status
        }
    },{new:true})
        .then( ( (GiftOrder) => {

            if( GiftOrder.order_status === 'Success' ){
                User.findOneAndUpdate({"_id":req.user._id},{
                    $set: {
                        wallet_balance: req.user.wallet_balance + GiftOrder.amountToreceive
                    }
                },{ new: true })
                    .then( (userUp) => {
                        return res.status(200).json(GiftOrder)
                    } )
                    .catch( err => {
                        let server_error_message = MongoDBerrorformat(err)
                        return res.status(403).json({
                            error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                            special_message:null
                        })
                    } )
            }else{
                return res.status(200).json(GiftOrder)
            }

        } ) )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err,"Giftcard")
            console.log(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )
        
} )

module.exports = router