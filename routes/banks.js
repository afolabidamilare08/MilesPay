const router = require("express").Router();
const {MongoDBerrorformat, Joierrorformat } = require("../err/error_edit");
const Banks = require('../models/user_bank_model');
const { validateBank } = require("../validator/formsValidator");
const { VerifyUserToken } = require("../validator/TokenValidator");


// add bank details

router.get('/my_banks', VerifyUserToken, async (req,res) => {

    Banks.find({
        user: req.user._id
    })
    .then( (banks) => {
        res.status(200).json(banks)
    } )
    .catch( err => {
        let server_error_message = MongoDBerrorformat(err)
        return res.status(403).json({
            error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
            special_message:null
        })
    })

} )

router.post('/add_bank', VerifyUserToken, async (req, res) => {


    const { error, value } = validateBank(req.body)

    if( error ){
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    Banks.findOne({
        user: req.user._id,
        account_number: value.account_number
    })
    .then( (bank) => {

        if ( bank ) {
            return res.status(403).json({
                error_message: "This Bank Account Has been saved already" ,
                special_message:null
            });
        }else{

            const user = req.user._id
            const account_number = value.account_number
            const account_name = value.account_name
            const bank_name = value.bank_name
            const bank_id = value.bank_id

            const newBank = new Banks({
                user,
                account_number,
                account_name,
                bank_name,
                bank_id
            })

            newBank.save()
                .then( bank => {
                    res.status(201).json(bank)
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




module.exports = router