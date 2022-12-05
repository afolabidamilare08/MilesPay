const router = require("express").Router();
const User = require("../models/user_model");
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const Axios = require('axios');
const { validateSignup, validateSignin, validateEdit, validateResetPassword, validateTransactionPin } = require("../validator/formsValidator");
const { Joierrorformat, MongoDBerrorformat } = require("../err/error_edit");
const { VerifyUserToken } = require("../validator/TokenValidator");
const https = require('https')


// this is the register route of the project

router.post('/register', async (req, res) => {


    const { error, value } = validateSignup(req.body);

    if (error) {
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    const full_name = value.full_name
    const email = value.email
    const phone_number = value.phone_number
    const transaction_pin = null
    const password = CryptoJS.AES.encrypt(value.password, process.env.CRYPTO_PASS_SEC ).toString()

    const newUser = new User({
        full_name,
        email,
        phone_number,
        password,
        transaction_pin
    })

    newUser.save()
        .then( (user) => {
            const { password, transaction_pin ,...others } = user._doc
            res.status(201).json({
                ...others,
                transaction_pin:null
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

// this is the login  route of the project

router.post('/login', async (req, res) => {

    const { error, value } = validateSignin(req.body)

    if (error) {
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    User.findOne({ email: value.email })
        .then( (user) => {

            if (!user) {
                return res.status(403).json({
                    error_message: "Incorrect email address" ,
                    special_message:null
                });
            }

            const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.CRYPTO_PASS_SEC)
            const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8)

            if (Originalpassword !== req.body.password) {
                return res.status(403).json({
                    error_message: "Incorrect password" ,
                    special_message:null
                });   
            }

            const Token = jwt.sign({
                id: user._id
            }, process.env.JWT_SEC)

            const { password, transaction_pin ,...others } = user._doc

            return res.status(200).json({
                ...others,
                Token,
                transaction_pin: transaction_pin ? "exist" : null
            })
        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )


    // Axios.defaults.baseURL = 'https://api.paystack.co'; 
    // Axios.defaults.headers.common['token'] = 'Bearer ' + 'sk_live_e37acb4d5159d4b8474d9bb8ad72f5a625ff05de'

    // Axios({
    //     method:"get",
    //     url:"/bank",
    // }).then( (response) => {
    //     res.status(200).json(response.data)
    // } )
    // .catch( err => res.status(403).json(err) )

} )


// this is the edit profile route of the project

router.put('/update', VerifyUserToken, async (req,res) => {

    const { error, value } = validateEdit(req.body)

    if (error) {
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    const full_name = value.full_name
    const email = value.email
    const phone_number = value.phone_number

    const newUser = {
        full_name,
        email,
        phone_number,
    }

    User.findByIdAndUpdate(
        req.user._id,
        { $set : {
            ...newUser
        } },
        { new: true })
        .then( (user) => {
            const { password, transaction_pin ,...others } = user._doc
            return res.status(200).json({ 
                ...others,
                transaction_pin: transaction_pin ? "exist" : null
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

// this is the edit profile route of the project

router.put('/reset_password', VerifyUserToken, async (req,res) => {

    const { error, value } = validateResetPassword(req.body)

    if (error) {
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    const password = CryptoJS.AES.encrypt(value.password, process.env.CRYPTO_PASS_SEC ).toString()

    const newUser = {
        password
    }

    User.findByIdAndUpdate(
        req.user._id,
        { $set : {
            ...newUser
        } },
        { new: true })
        .then( (user) => {
            const { password, transaction_pin ,...others } = user._doc
            return res.status(200).json({ 
                ...others,
                transaction_pin: transaction_pin ? "exist" : null
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


// this is for updating and editing the user Pin

router.put('/update_pin', VerifyUserToken, async (req,res) => {

    const { error, value } = validateTransactionPin(req.body)

    if (error) {
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    if ( req.user.transaction_pin ) {
        
        const hashedPin = CryptoJS.AES.decrypt(req.user.transaction_pin, process.env.CRYPTO_PIN_SEC)
        const OriginalPin = hashedPin.toString(CryptoJS.enc.Utf8)

        if (OriginalPin !== value.old_pin) {
            return res.status(403).json({
                error_message: "Incorrect pin" ,
                special_message:null
            });   
        }

    }

    const transaction_pin = CryptoJS.AES.encrypt(value.new_pin, process.env.CRYPTO_PIN_SEC ).toString()

    User.findByIdAndUpdate(
        req.user._id,
        { $set: {
            transaction_pin : transaction_pin
        } },
        { new: true })
        .then( (user) => {
            const { password, transaction_pin ,...others } = user._doc
            return res.status(200).json({ 
                ...others,
                transaction_pin: transaction_pin ? "exist" : null
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


module.exports = router