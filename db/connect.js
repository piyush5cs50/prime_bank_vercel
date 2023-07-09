const mongoose = require("mongoose");


console.log("MongoDB_connection_URI: " + process.env.MongoDB_connection_URI)
mongoose.set('strictQuery', false)
mongoose.connect(process.env.MongoDB_connection_URI)
.then(() => console.log("connection successful"))
.catch((e) => console.log(e))
