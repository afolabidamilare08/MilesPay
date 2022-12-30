const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const WalletWithdrawalSchema = new Schema({
    user:{ type: String, required:true },
    bank:{ type: Object, required:true },
    amount_withdraw:{ type: Number, required:true, },
    withdrawal_status:{ type: String, required:true, enum: ['Pending', 'Success', 'Failed'] }
},{
    timestamps:true
})

const WalletWithdrawal = mongoose.model('WalletWithdrawal',WalletWithdrawalSchema);

module.exports = WalletWithdrawal
