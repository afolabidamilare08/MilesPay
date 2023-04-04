const Joi = require('joi');

// this file contains all the form validatiors of the projects

const validator = schema => (payload) => schema.validate(payload)

// formvalidation for signup
const signupSchema = Joi.object({
    full_name: Joi.string().min(4).max(30).required(),
    email: Joi.string().email().required(),
    phone_number: Joi.string().min(11).max(11).required(),
    password: Joi.string().min(4).max(30).required(),
})

// formvalidation for signin
const signinSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(30).required(),
})

// formvalidation for updatingProfile
const editprofileSchema = Joi.object({
    full_name: Joi.string().min(4).max(30).required(),
    email: Joi.string().email().required(),
    phone_number: Joi.string().min(11).max(11).required(),
})

// formvalidation for passsword_reset
const passwordrestSchema = Joi.object({
    old_password: Joi.string().min(4).max(30).required(),
    new_password: Joi.string().min(4).max(30).required(),
})


// formvalidation for forgot_password
const ForgotpasswordSchema = Joi.object({
    email: Joi.string().email().required(),
})


// formvalidation for forgot_password
const VerifyForgotpasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(4).required()
})


// formvalidation for user otp for verification
const VerifyUserSchema = Joi.object({
    user_id: Joi.string().required(),
    email: Joi.string().email().required()
})

// formvalidation for password_reset with email
const ResetpasswordEmailSchema = Joi.object({
    email: Joi.string().email().required(),
    new_password: Joi.string().min(4).max(30).required(),
})

// formvalidation for Bank
const BankSchema = Joi.object({
    account_number: Joi.string().min(10).max(10).required(),
    account_name: Joi.string().required(),
    bank_name: Joi.string().required(),
    bank_id: Joi.number().required(),
})

const WithdrawSchema = Joi.object({
    withdrawal_amount:Joi.number().min(1000).max(100000).required(),
    account_number:Joi.string().min(10).max(10).required()
})


const Transaction_PinSchema = Joi.object({ 
    old_pin: Joi.string().min(4).max(4).required(),
    new_pin: Joi.string().min(4).max(4).required(),
})

const ConfirmTransaction_PinSchema = Joi.object({ 
    pin: Joi.string().min(4).max(4).required(),
})




const ReportBugSchema = Joi.object({
    report_message: Joi.string().required(),
    report_image: Joi.object()
})





const CryptoSchema = Joi.object({
    crypto_name: Joi.string().required(),
    crypto_address: Joi.string().required(),
    crypto_init_price_per_one: Joi.number().required(),
    crypto_resell_dollar_price: Joi.number().required(),
    crypto_symbol:Joi.string().required()
})

const CryptoOrderSchema = Joi.object({
    crypto_id:Joi.string().required(),
    crypto_amount_received: Joi.number().required(),
    crypto_wallet_type: Joi.string().required(),
    crypto_proof: Joi.object()
})




const GbrandSchema = Joi.object({
    Gbrand_name:Joi.string().required(),
    Gbrand_description: Joi.string().required(),
    Gbrand_image: Joi.object()
})

const GiftcardSchema = Joi.object({
    Giftcard_brand:Joi.string().required(),
    Giftcard_country: Joi.string(),
    Giftcard_type: Joi.string().required(),
    Giftcard_price_per_dollar: Joi.number().required()
})

const GiftOrderSchema = Joi.object({
    Giftcard_brand:Joi.string().required(),
    Giftcard_country: Joi.string(),
    Giftcard_type: Joi.string(),
    Giftcard_amount: Joi.number().required(),
    order_image: Joi.object()
})

exports.validateSignup = validator(signupSchema)
exports.validateSignin = validator(signinSchema)
exports.validateEdit = validator(editprofileSchema)


exports.validateResetPassword = validator(passwordrestSchema)
exports.validateForgotPassword = validator(ForgotpasswordSchema)
exports.validateVerifyForgotPassword = validator(VerifyForgotpasswordSchema)
exports.validateForgotPasswordEmailReset = validator(ResetpasswordEmailSchema)
exports.validateUserVerification = validator(VerifyUserSchema)


exports.validateCryptoVerification = validator(CryptoSchema)
exports.validateCryptoVerification = validator(CryptoSchema)
exports.validateCryptoOrderVerification = validator(CryptoOrderSchema)


exports.validateGbrandVerification = validator(GbrandSchema)
exports.validateGiftcardVerification = validator(GiftcardSchema)
exports.validateGiftOrderVerification = validator(GiftOrderSchema)


exports.validateBank = validator(BankSchema)
exports.validateWithdrawal = validator(WithdrawSchema)

exports.validateTransactionPin = validator(Transaction_PinSchema)
exports.validateConfirmTransactionPin = validator(ConfirmTransaction_PinSchema)


exports.validateReportBug = validator(ReportBugSchema)

