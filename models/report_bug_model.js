const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ReportBugSchema = new Schema({
    user:{ type: Object, required:true },
    report_message:{type:String,required:true},
    report_image: { type: Object, required: false },

},{
    timestamps:true
})

const ReportBug = mongoose.model('ReportBug',ReportBugSchema);

module.exports = ReportBug
