const jwt = require('jsonwebtoken');
const { MongoDBerrorformat } = require('../err/error_edit');
const User = require('../models/user_model');
const formidable = require('formidable');
const cloudinary = require('cloudinary').v2



const VerifyUserToken = ( req, res, next ) => {

    const authHeader = req.headers.token

    if ( authHeader ) {
        
        const token = authHeader.split(" ")[1];

        jwt.verify( token, process.env.JWT_SEC, (err, user) => {

            if (err) {
                res.status(403).json({
                    error_message: "Invalid Token" ,
                    special_message:null
                })
            }else{

                User.findOne({_id:user.id})
                    .then( (userDetails) => {

                        req.user = userDetails
                        next()

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

    }else{
        return res.status(401).json({
            error_message: "You are not Authenticated" ,
            special_message:null
        })
    }

}

const VerifyAdminToken = ( req, res, next ) => {

    const authHeader = req.headers.token

    if ( authHeader ) {
        
        const token = authHeader.split(" ")[1];

        jwt.verify( token, process.env.JWT_SEC, (err, user) => {

            if (err) {
                res.status(403).json({
                    error_message: "Invalid Token" ,
                    special_message:null
                })
            }else{

                User.findOne({_id:user.id})
                    .then( (userDetails) => {

                        if ( !userDetails.isAdmin ) {
                            return res.status(401).json({
                                error_message: "You are not Authenticated" ,
                                special_message:null
                            })
                        }

                        req.user = userDetails
                        next()

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

    }else{
        return res.status(401).json({
            error_message: "You are not Authenticated" ,
            special_message:null
        })
    }

}

const FormidableVefification = (req, res, next) => {
    const form = formidable({ multiples: true })
    form.parse(req,(err,fields,files) => {
        if (err) {
            next();
            // return;
          }
        req.data = ({ ...fields, ...files })
        next()
    } )

} 


const saveReportBugImage = async ( req,res,next ) => {

    const uploadImage = async (imagetoupload) => {

        // Use the uploaded file's name as the asset's public ID and 
        // allow overwriting the asset with new versions
        const options = {
          use_filename: true,
          unique_filename: false,
          overwrite: true, 
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

    const UploadFUnction = async () => {
        
        var image = req.data.report_image   
            
        const result = await uploadImage(image.filepath)

        return result
    }

    const NewIMage = UploadFUnction()

    req.Image = NewIMage
    console.log(NewIMage)
    next()

}



module.exports = { VerifyUserToken, FormidableVefification, VerifyAdminToken, saveReportBugImage }