const mongoose = require('mongoose')

const GbrandSchema = new mongoose.Schema({
    Gbrand_name: { type: String, required: true, unique: true },
    Gbrand_description: { type: String, required: false, unique: false },
    Gbrand_image:{ type: Object, required:false },
}, {
    timestamps: true
})


const Gbrand = mongoose.model("Gbrand", GbrandSchema)

module.exports = Gbrand