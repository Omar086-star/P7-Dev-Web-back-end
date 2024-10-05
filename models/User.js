const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = mongoose.model("User", UserSchema); // Use `mongoose.model` for model creation

module.exports={User}