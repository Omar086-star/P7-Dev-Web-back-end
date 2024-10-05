require('dotenv').config();
const mongoose = require("mongoose");

const DB_URL = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@${process.env.URLDB}`;

async function connect() {
    try {
        // No need to pass `useNewUrlParser` and `useUnifiedTopology`
        await mongoose.connect(DB_URL);
        console.log("Connected to MongoDB");
    } catch (e) {
        console.error("Connection error:", e);
    }
}

connect();



module.exports = { mongoose };
