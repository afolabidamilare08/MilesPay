const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ResetPasswordOtp = new Schema({
    // user:{ type: String, required:true },
    email:{ type: String, required:true, },
    otp: { type: Number, required: true, unique: true },
},{
    timestamps:true
})

const ForgotOtp = mongoose.model('ForgotOtp',ResetPasswordOtp);

module.exports = ForgotOtp
