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





// formvalidation for updatingProfile
const BankSchema = Joi.object({
    account_number: Joi.string().min(10).max(10).required(),
    account_name: Joi.string().required(),
    bank_name: Joi.string().required(),
    bank_id: Joi.number().required(),
})


const Transaction_PinSchema = Joi.object({
    old_pin: Joi.string().min(4).max(4).required(),
    new_pin: Joi.string().min(4).max(4).required(),
})


exports.validateSignup = validator(signupSchema)
exports.validateSignin = validator(signinSchema)
exports.validateEdit = validator(editprofileSchema)
exports.validateResetPassword = validator(passwordrestSchema)


exports.validateBank = validator(BankSchema)

exports.validateTransactionPin = validator(Transaction_PinSchema)
