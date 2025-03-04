const mongoose = require("mongoose");
const connectDB = async()=>{
    await mongoose.connect("mongodb+srv://rehan_rh__:skMcRioZNosOZ2OD@rehan.l02hu.mongodb.net/resumeAnalyser");
}
module.exports = connectDB;