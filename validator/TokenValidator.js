const jwt = require('jsonwebtoken');
const { MongoDBerrorformat } = require('../err/error_edit');
const User = require('../models/user_model');


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


module.exports = { VerifyUserToken }