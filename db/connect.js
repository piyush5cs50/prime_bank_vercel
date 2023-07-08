const mongoose = require("mongoose");

const db = 'mongodb+srv://piyushahuja733:YPdsMJzU7ELtzQr6@cluster0.voyncd8.mongodb.net/PrimeBankAccount?retryWrites=true&w=majority'
mongoose.set('strictQuery', false)
mongoose.connect(db)
.then(() => console.log("connection successful"))
.catch((e) => console.log(e))
