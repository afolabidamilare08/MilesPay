const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const UserBankDetailsSchema = new Schema({
    user:{ type: String, required:true },
    account_number:{ type: String, required:true, },
    account_name:{ type: String, required:true, },
    bank_name:{ type: String, required:true },
    bank_id:{ type: Number, required:true },
},{
    timestamps:true
})

const Banks = mongoose.model('Banks',UserBankDetailsSchema);

module.exports = Banks
