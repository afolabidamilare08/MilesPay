const router = require("express").Router();
const User = require("../models/user_model");
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const Axios = require('axios');
const { validateSignup, 
        validateSignin, 
        validateEdit, 
        validateResetPassword, 
        validateTransactionPin, 
        validateForgotPassword, 
        validateVerifyForgotPassword, 
        validateForgotPasswordEmailReset, 
        validateUserVerification, 
        validateWithdrawal, 
        validateConfirmTransactionPin} = require("../validator/formsValidator");
const { Joierrorformat, MongoDBerrorformat } = require("../err/error_edit");
const { VerifyUserToken } = require("../validator/TokenValidator");
const https = require('https');
const ForgotOtp = require("../models/reset_password_otp");
const nodemailer = require('nodemailer');
const OtpUserVeri = require("../models/otp_verification_model");
const Banks = require("../models/user_bank_model");
const WalletWithdrawal = require("../models/withdrawals_model");
const { response } = require("express");


{/* <img
                src="https://res.cloudinary.com/drcn2xv3q/image/upload/v1670104109/d233b70d-c49d-45be-9425-ef9a322ade3d_ykiczi.jpg"
                style="width: 150px; height: 150px; display: block; margin: 20px auto"
                /> */}



const ForgotEmailPassword = async (data) => {


    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'afolabidamilare08@gmail.com',
          pass: process.env.GMAIL_PASS
        }
      });

    var mailOptions = {
        from: 'afolabidamilare08@gmail.com',
        to: data.email,
        // to: "kwekumac10@gmail.com",
        subject: `OTP Verification - Miles Pay`,
        html: `
        
                <body
                style="
                color: black;
                font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
                "
            >
                
                <div
                style="
                    font-weight: bold;
                    text-align: center;
            
                    margin-top: 20px;
                "
                >
                Forgot Password OTP Verification
                </div>
                <div style="text-align: center; margin-top: 40px">
                Your OTP verification code is:
                </div>
                <div style="text-align: center; margin-top: 40px; font-weight: bold">
                ${data.otp}
                </div>
            </body>

        `
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          return { status: "failed",info:error }
        } else {
          console.log('Email sent: ' + info.response);
          return { status: "successfull",info:info.response }
        }
      });


  }




  

const VerifyUserEmail = async (data) => {


    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'afolabidamilare08@gmail.com',
          pass: process.env.GMAIL_PASS
        }
      });

    var mailOptions = {
        from: 'afolabidamilare08@gmail.com',
        to: data.email,
        subject: `OTP Verification - Miles Pay`,
        html: `
        
                <body
                style="
                color: black;
                font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
                "
            >
                
                <div
                style="
                    font-weight: bold;
                    text-align: center;
            
                    margin-top: 20px;
                "
                >
                 OTP Verification
                </div>
                <div style="text-align: center; margin-top: 40px">
                Your OTP verification code is:
                </div>
                <div style="text-align: center; margin-top: 40px; font-weight: bold">
                ${data.otp}
                </div>
            </body>

        `
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          return { status: "failed",info:error }
        } else {
          console.log('Email sent: ' + info.response);
          return { status: "successfull",info:info.response }
        }
      });


  }













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

    const hashedPassword = CryptoJS.AES.decrypt(req.user._doc.password, process.env.CRYPTO_PASS_SEC)
    const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8)

    if (Originalpassword !== value.old_password) {
        return res.status(403).json({
            error_message: "Your old password is incorrect" ,
            special_message:null
        });   
    }

    const password = CryptoJS.AES.encrypt(value.new_password, process.env.CRYPTO_PASS_SEC ).toString()

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
                error_message: "Your old pin is incorrect" ,
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


router.post('/confirm_transaction_pin', VerifyUserToken, async (req,res) => {

    
    const { error, value } = validateConfirmTransactionPin(req.body)

    if (error) {
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    if ( req.user.transaction_pin ) {
        
        const hashedPin = CryptoJS.AES.decrypt(req.user.transaction_pin, process.env.CRYPTO_PIN_SEC)
        const OriginalPin = hashedPin.toString(CryptoJS.enc.Utf8)

        if (OriginalPin !== value.pin) {
            return res.status(403).json({
                error_message: "Your old pin is incorrect" ,
                special_message:null
            });   
        }else{
            return res.status(200).json({message:"Transaction Pin Is Correct"})
        }

    }else{
        return res.status(403).json({
            error_message: "You are yet to create a transaction pin" ,
            special_message:null
        });  
    }

} )

// this is to get the user profile

router.get('/my_profile',VerifyUserToken, async ( req, res ) => {

    const { password, transaction_pin ,...others } = req.user._doc

    return res.status(200).json({
        ...others,
        transaction_pin: transaction_pin ? "exist" : null
    })

} )


// forgotPassword Otp email

router.post('/forgot_pass_email', async ( req, res ) => {

    const { error, value } = validateForgotPassword(req.body)

    if (error) {
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    User.findOne({ email: value.email })
        .then( (user) => {

            if(user){


                ForgotOtp.findOne({ email: value.email })
                    .then( (Otp) => {

                        const randomOtp = Math.floor(Math.random() * 9000 + 1000);

                        if (Otp) {
                            
                            ForgotOtp.findOneAndUpdate({ email: value.email },{
                                $set:{
                                    otp:randomOtp
                                }
                            },{new:true})
                                .then( (thenewOtp) => {
                                    // send email here 
                                    ForgotEmailPassword(thenewOtp)
                                    return res.status(200).json(thenewOtp)
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

                            const email = value.email
                            const otp = randomOtp
                
                            const ForgOtp = new ForgotOtp({
                                email,
                                otp
                            })
                
                            ForgOtp.save()
                                .then( (otpDetails) => {
                                    // SendEmail(otpDetails)
                                    ForgotEmailPassword(otpDetails)
                                    res.status(200).json(otpDetails)
                                    // return 
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


            }
            
            else{
                return res.status(200).json("Invalid User")
            }

        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        })

} )

// verify Otp forgotPassword Otp email
router.put( '/verify_forgotpass', async (req, res) => {

    const { error, value } = validateVerifyForgotPassword(req.body)

    if (error) {
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    ForgotOtp.findOne({email:value.email})
        .then( (Otp) => {

            if ( Otp ) {
                
                const oldTimeupdatedate = new Date(Otp.updatedAt)
                const nowTIme = new Date()

                const oldtimetime = oldTimeupdatedate.getTime()
                const nowtimetime = nowTIme.getTime()
        
                const calculate_difference = new Date( nowtimetime - oldtimetime )
        
                const minn = Math.floor(calculate_difference.getTime() / 60000) % 60;
        
                var thebodyOtp = parseInt(value.otp)


                if( minn < 10 || minn == 10 ){
                    if( Otp.otp === thebodyOtp ){
        
                        return res.status(200).json("yes")
        
                    } else{
                        return res.status(403).json({
                            error_message: "Invalid Otp" ,
                            special_message:null
                        })
                    }
                }
        
                if( minn > 10 ){
                    return res.status(403).json({
                        error_message: "Otp Code has expired" ,
                        special_message:null
                    }) 
                }

            }

            else{

                return res.status(403).json({
                    error_message: "This email did not request for password reset" ,
                    special_message:null
                })  
                 
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


// reset password with just email
router.put('/email_reset_password', async (req,res) => {

    const { error, value } = validateForgotPasswordEmailReset(req.body)

    if (error) {
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    ForgotOtp.findOne({ email: value.email })
        .then( (OtpUser) => {

            if ( OtpUser ) {
            
                const password = CryptoJS.AES.encrypt(value.new_password, process.env.CRYPTO_PASS_SEC ).toString()
            
                const newUser = {
                    password
                }
            
                User.findOneAndUpdate(
                    {email:value.email},
                    { $set : {
                        ...newUser
                    } },
                    { new: true })
                    .then( (user) => {
                        const { password, transaction_pin ,...others } = user._doc

                        ForgotOtp.findOneAndDelete({email:value.email})
                            .then( (removed) => {

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
                    .catch( err => {
                        let server_error_message = MongoDBerrorformat(err)
                        return res.status(403).json({
                            error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                            special_message:null
                        })
                    } )

            }

            else{
                return res.status(403).json({
                    error_message: "You are not authorized to do that" ,
                    special_message:null
                })
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



// Send User Otp

router.post( '/send_user_otp', async (req,res) => {

    const { error, value } = validateUserVerification(req.body)
    
    if (error) {
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    OtpUserVeri.findOne({user_id:value.user_id})
        .then( (UserOtp) => {

            const randomOtp = Math.floor(Math.random() * 9000 + 1000);

            if ( UserOtp ) {
                OtpUserVeri.findOneAndUpdate({"user_id":value.user_id},{
                    $set:{
                        otp:randomOtp
                    }
                },{new:true})
                    .then( (otpDetails) => {
                        VerifyUserEmail(otpDetails)
                        res.status(200).json(otpDetails)
                        // return 
                    } )
                    .catch( err => {
                        console.log(err)
                        let server_error_message = MongoDBerrorformat(err)
                        return res.status(403).json({
                            error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                            special_message:null
                        })
                    } )
            }

            if( !UserOtp ){

                const user_id = value.user_id
                const otp = randomOtp
                const email = value.email
    
                const newOtp = new OtpUserVeri({
                    user_id,
                    otp,
                    email
                })
    
                newOtp.save()
                    .then( (otpDetails) => {
                        VerifyUserEmail(otpDetails)
                        res.status(200).json(otpDetails)
                        // return 
                    } )
                    .catch( err => {
                        let server_error_message = MongoDBerrorformat(err)
                        console.log(err)
                        return res.status(403).json({
                            error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                            special_message:null
                        })
                    } )

            }

        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err)
            console.log(err)
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )


} )


// Verify User Otp

router.put( '/verify_user_otp', async (req,res) => {

    const { error, value } = validateVerifyForgotPassword(req.body)

    if (error) {
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    OtpUserVeri.findOne({email:value.email})
        .then( (TheOtpdetailsdetails) => {

            const oldTimeupdatedate = new Date(TheOtpdetailsdetails.updatedAt)
            const nowTIme = new Date()
    
            const oldtimetime = oldTimeupdatedate.getTime()
            const nowtimetime = nowTIme.getTime()
    
            const calculate_difference = new Date( nowtimetime - oldtimetime )
    
            const minn = Math.floor(calculate_difference.getTime() / 60000) % 60;
    
            var thebodyOtp = parseInt(value.otp)
    
            if( minn < 10 || minn == 10 ){
                if( TheOtpdetailsdetails.otp === thebodyOtp ){
    
                    User.findOneAndUpdate({email:value.email},
                        { $set: {
                            ...req.data,
                            isVerified: true
                        }, },
                        { new: true })
                        .then((user) => {

                            OtpUserVeri.findOneAndDelete({email:value.email})
                                .then( (deleted) => {
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
                        })
                        .catch( err => {
                            let server_error_message = MongoDBerrorformat(err)
                            return res.status(403).json({
                                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                                special_message:null
                            })
                        } )
    
                } else{
                    return res.status(403).json({
                        error_message: "Invalid Otp" ,
                        special_message:null
                    }) 
                }
            }
    
            if( minn > 10 ){
                return res.status(403).json({
                    error_message: "Otp Code has expired" ,
                    special_message:null
                })  
            }            

        } )
        .catch( err => {
            let server_error_message = MongoDBerrorformat(err,"User")
            return res.status(403).json({
                error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                special_message:null
            })
        } )    

} )



router.put('/wallet_withdrawal', VerifyUserToken, async (req,res) => {

    const { error, value } = validateWithdrawal(req.body)

    if (error) {
        return res.status(400).json(Joierrorformat(error.details[0]))
    }

    Banks.findOne({
        user: req.user._id,
        account_number: value.account_number
    })
    .then( (Thebank) => {

        if( !Thebank ){
            return res.status(403).json({
                error_message: "This Bank Account is invalid" ,
                special_message:null
            });
        }else{

            if ( value.withdrawal_amount > req.user.wallet_balance ) {
                return res.status(403).json({
                    error_message: "Insufficient Balance ",
                    special_message:null
                });
            }else{

                User.findOneAndUpdate({"_id":req.user._id},{
                    $set: {
                        wallet_balance: req.user.wallet_balance - value.withdrawal_amount
                    }
                },{ new: true })
                .then( (Theuser) => {
                    

                    const user = req.user._id
                    const bank = {
                        account_number:Thebank.account_number,
                        bank_name:Thebank.bank_name
                    }
                    const amount_withdraw = value.withdrawal_amount
                    const withdrawal_status = 'Success'
                
                    const AddWithdrawal = new WalletWithdrawal({
                        user,
                        bank,
                        amount_withdraw,
                        withdrawal_status
                    })
                    
                    AddWithdrawal.save()
                    .then( (result) => {
                        const { password, transaction_pin ,...others } = Theuser._doc
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
                    .catch( err => {
                        console.log(err)
                        let server_error_message = MongoDBerrorformat(err)
                        return res.status(403).json({
                            error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
                            special_message:null
                        })
                    } )
            }

        }

    } )
    .catch( err => {
        let server_error_message = MongoDBerrorformat(err)
        return res.status(403).json({
            error_message: server_error_message == "server error" ? "Server Error" : server_error_message ,
            special_message:null
        })
    } )

}  )



router.get('/my_withdrawals', VerifyUserToken, async (req,res) => {

    WalletWithdrawal.find({
        user:req.user._id
    }).sort({ _id: -1 })
    .then( (allWithdrawals) => {
        return res.status(200).json(allWithdrawals)
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
