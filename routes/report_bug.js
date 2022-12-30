const router = require("express").Router();
const {MongoDBerrorformat, Joierrorformat } = require("../err/error_edit");
const ReportBug = require("../models/report_bug_model");
const { validateReportBug } = require("../validator/formsValidator");
const { VerifyUserToken, FormidableVefification, saveReportBugImage } = require("../validator/TokenValidator");
const cloudinary = require('cloudinary').v2;






const DeleteUploadedImage = (data) => {

    console.log("familay")

    for (let k = 0; k < data.length; k++) {
        cloudinary.uploader.destroy(data[k].public_id)
    }

}



const savePictures = async ( req,res,next ) => {

    if(!req.data.report_image){
        next()
    }else{

        const Images = []

    const IncomingSister = [req.data.report_image]

    const uploadImage = async (imagetoupload) => {

        // Use the uploaded file's name as the asset's public ID and 
        // allow overwriting the asset with new versions
        const options = {
          use_filename: true,
          unique_filename: false,
          overwrite: true, 
          folder:'report_bug'
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





router.post('/create_bug', VerifyUserToken, FormidableVefification ,savePictures, async (req, res) => {

    // console.log(req.Images)

    const { error, value } = validateReportBug(req.data)

    if( error ){
        DeleteUploadedImage(req.Images) 
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    const user = {
        full_name:req.user.full_name,
        email: req.user.email,
        phone_number: req.user.phone_number,
    }

    const report_message = value.report_message

    const report_image = req.Images ? req.Images.length > 0 ? req.Images[0] : null : null

    const newReport = new ReportBug({
        user,
        report_message,
        report_image
    }) 

    newReport.save()
        .then( (bug_report) => {
            res.status(201).json(bug_report)
        } )
        .catch( err => {
            DeleteUploadedImage(req.Images) 
            let server_error_message = MongoDBerrorformat(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )

} )

module.exports = router