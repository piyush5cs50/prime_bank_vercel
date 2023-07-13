const mongoose = require("mongoose");


console.log("MongoDB_connection_URI: " + process.env.MongoDB_connection_URI)
mongoose.set('strictQuery', false)
mongoose.connect('mongodb+srv://piyushahuja733:YPdsMJzU7ELtzQr6@cluster0.voyncd8.mongodb.net/PrimeBankAccount?retryWrites=true&w=majority')
.then(() => console.log("connection successful"))
.catch((e) =>{
console.log("error in connection String") 
console.log(e)})

// mongodb+srv://piyushahuja733:<password>@cluster0.voyncd8.mongodb.net/
// 

// mongodb compass connection string
// "mongodb://127.0.0.1:27017/RegistrationDB"