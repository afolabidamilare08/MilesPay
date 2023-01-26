const router = require("express").Router();
const {MongoDBerrorformat, Joierrorformat } = require("../err/error_edit");
const Gbrand = require("../models/Gbrand_model");
const Giftcard = require("../models/Giftcard_model");
const { validateGbrandVerification, validateGiftcardVerification } = require("../validator/formsValidator");
const { VerifyAdminToken, FormidableVefification } = require("../validator/TokenValidator");
const cloudinary = require('cloudinary').v2;



const savePictures = async ( req,res,next ) => {

    if( !req.data.Gbrand_image ){
        next()
    }

    else{

        const Images = []

        const IncomingSister = [req.data.Gbrand_image]
    
        const uploadImage = async (imagetoupload) => {
    
            // Use the uploaded file's name as the asset's public ID and 
            // allow overwriting the asset with new versions
            const options = {
              use_filename: true,
              unique_filename: false,
              overwrite: true, 
              folder:'gift_cards'
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



router.get('/get_gbrands', async (req,res) => {

    Gbrand.find().sort()
        .then( (Gbrands) => {
            return res.status(200).json(Gbrands)
        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )


} )






router.get('/get_giftcards', async (req,res) => {

    Giftcard.find().sort()
        .then( (giftcards) => {
            return res.status(200).json(giftcards)
        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )


} )






router.post('/add_Gbrand', VerifyAdminToken, FormidableVefification, savePictures, async (req,res) => {

    const { error, value } = validateGbrandVerification(req.data)

    if (error) {
        DeleteUploadedImage(req.Images) 
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    const newGbrand = new Gbrand({
        Gbrand_name:value.Gbrand_name,
        Gbrand_description:value.Gbrand_description,
        Gbrand_image: req.Images ? req.Images.length > 0 ? req.Images[0] : null : null 
    })

    newGbrand.save()
        .then( (newgbrand) => {
            return res.status(201).json(newgbrand)
        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err)
            DeleteUploadedImage(req.Images) 
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )

}  )





router.put('/edit_Gbrand/:id', VerifyAdminToken, FormidableVefification, savePictures, async (req,res) => {

    const { error, value } = validateGbrandVerification(req.data)

    if (error) {
        DeleteUploadedImage(req.Images) 
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    var datatosend = {
        Gbrand_name:value.Gbrand_name,
        Gbrand_description: value.Gbrand_description
    }

    if ( req.Images ) {
        
        if( req.Images.length > 0 ){
            datatosend = {
                ...datatosend,
                Gbrand_image:req.Images[0]
            }
        }

    }

    Gbrand.findOneAndUpdate({"_id":req.params.id},
        { $set:{
            ...datatosend
        } },
        { new: true})
        .then( (updatedGbrand) => {

            return res.status(200).json(updatedGbrand)

        } )
        .catch( err => {
            console.log(err)
            let server_error_message = MongoDBerrorformat(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )

} )





router.post('/add_gift_card', VerifyAdminToken, async (req,res) => {


    const { error, value } = validateGiftcardVerification(req.body)

    if (error) {
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    Gbrand.findOne({"_id":value.Giftcard_brand})
        .then( (gbrand) => {

            Giftcard.findOne({
                Giftcard_brand:gbrand._id,
                Giftcard_country:value.Giftcard_country ? value.Giftcard_country : null,
                Giftcard_type:value.Giftcard_type,
            }).then( (itExist) => {

                if ( itExist ) {
                    return res.status(403).json({
                        error_message:"This giftcard already exist",
                        special_message:null
                    })
                }else{
                    
                    const newGiftcard = new Giftcard({
                        Giftcard_brand:gbrand._id,
                        Giftcard_country:value.Giftcard_country ? value.Giftcard_country : null,
                        Giftcard_type:value.Giftcard_type,
                        Giftcard_price_per_dollar:value.Giftcard_price_per_dollar
                    })
        
                    newGiftcard.save()
                        .then( (savedGcard) => {
                            return res.status(201).json(savedGcard)
                        } )
                        .catch( err => {
                            let server_error_message = MongoDBerrorformat(err)
                            return res.status(403).json({
                                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                                special_message:null
                            })
                        } )

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
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )

} )






router.put('/edit_giftcard/:id', VerifyAdminToken, async (req,res) => {

    const { error, value } = validateGiftcardVerification(req.body)

    if (error) {
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    Gbrand.findOne({"_id":value.Giftcard_brand}) 
        .then( (gbrand) => {

            var datatosend = {
                Giftcard_brand:gbrand._id,
                Giftcard_country:value.Giftcard_country ? value.Giftcard_country : null,
                Giftcard_type:value.Giftcard_type,
                Giftcard_price_per_dollar:value.Giftcard_price_per_dollar
            }

            Giftcard.findOneAndUpdate({"_id":req.params.id},
                { $set:{
                    ...datatosend
                } },
                {new:true})
                .then( (updatedGcard) => {
                    return res.status(200).json(updatedGcard)
                } )
                .catch( err => {
                    let server_error_message = MongoDBerrorformat(err)
                    return res.status(403).json({
                        error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                        special_message:null
                    })
                } )

        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )

} )




router.put('/delete_giftcard/:id', VerifyAdminToken, async (req,res) => {

            Giftcard.findOneAndDelete({"_id":req.params.id})
                .then( (updatedGcard) => {
                    return res.status(200).json(updatedGcard)
                } )
                .catch( err => {
                    let server_error_message = MongoDBerrorformat(err)
                    return res.status(403).json({
                        error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                        special_message:null
                    })
                } )

} )




router.get('/gift_card/:id', async (req,res) => {

    Gbrand.findOne({"_id":req.params.id})
        .then( (gbrand) => {

            Giftcard.find({"Giftcard_brand":req.params.id}).sort({_id:-1})
            .then( (giftcards) => {
                return res.status(200).json({
                    ...gbrand._doc,
                    gift_cards:giftcards
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
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )

} )


router.get('/gbrand_cards/', async (req,res) => {

    Gbrand.find()
        .then( (gbrands) => {


            Giftcard.find()
            .then( (giftcards) => {
                
                // console.log(gbrands)

                let AllGiftcards = []

                for (let h = 0; h < gbrands.length; h++) {
                    
                    let element = gbrands[h]
                    let elementsGiftCard = []

                    for (let j = 0; j < giftcards.length; j++) {

                        let giftelement = giftcards[j]

                        if (element._id == giftelement.Giftcard_brand ){
                            elementsGiftCard.push(giftelement)
                        }
                    }

                    AllGiftcards.push({
                        ...element._doc,
                        giftcards:[
                            ...elementsGiftCard
                        ]
                    })

                }

                return res.status(200).json(AllGiftcards)

            } )
            .catch( err => {
                console.log(err)
                let server_error_message = MongoDBerrorformat(err)
                return res.status(403).json({
                    error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                    special_message:null
                })
            } )

        } )
        .catch( err => {
            console.log(err)
            let server_error_message = MongoDBerrorformat(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )

} )

module.exports = router