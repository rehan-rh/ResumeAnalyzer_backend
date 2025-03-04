const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    emailId: {
      type: String,
      required: true,
      unique: true, //for not duplicate
      lowercase: true, //to convert entered caps to lowercase
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    resumes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resume" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
