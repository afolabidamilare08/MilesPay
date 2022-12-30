const mongoose = require('mongoose')

const OtpUserVeriSchema = new mongoose.Schema({
    user_id: { type: String, required: true, unique: true },
    otp: { type: Number, required: true, unique: true },
    email:{type: String, required:true, unique:true }
}, {
    timestamps: true
})

const OtpUserVeri = mongoose.model('OtpUserVeri',OtpUserVeriSchema);

module.exports = OtpUserVeri