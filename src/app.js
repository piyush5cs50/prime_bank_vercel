const express = require("express");
const bcrypt = require('bcrypt')
// const axios = require('axios')
const Nexmo = require('nexmo');
const jwt = require('jsonwebtoken')
require('dotenv').config()
const hbs = require('hbs');
const multer = require('multer');
const cookieParser = require('cookie-parser')
const faker = require('../node_modules/faker/package.json')
const app = express();
app.use(cookieParser());
require("../db/connect")
const user = require('../model/account')
const path = require('path')
const fs = require('fs')
const auth = require('../middleware/auth')
const port = process.env.PORT || 8000

// Configure multer to handle the uploaded file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
const upload = multer({ storage: storage })


hbs.registerHelper('fileExists', function (filePath) {
  try {
    console.log(filePath)
    const uploads = path.join(__dirname, '../uploads')
    console.log(uploads) 

    const img = path.join(uploads,"/", filePath)
    console.log(img)
    const doesExist = fs.existsSync(img);
    console.log(`Does image exist Exist ${doesExist}`)
    return doesExist
  } catch (error) {
    return false;
  }
});

// Initialize Nexmo with your API credentials
// const nexmo = new Nexmo({
//   apiKey: '66c1fbe7',
//   apiSecret: 'A6gs57VpE11WlsFJ',
// });

// Paths
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, "../public")))
const view_path = path.join(__dirname, "../template/views")
const partial_path = path.join(__dirname, "../template/partials")


app.set("view engine", "hbs")
app.set("views", view_path);


app.use(express.json())
app.use(express.urlencoded({extended:false}))


app.post('/register', upload.fields([{name:'passportImg'},{name:'adharImg'}]),  async(req,res) => {
  
 const{first__name,last__name,email,phone,password,confirm__password,inputAddress,city,option,ammount,pan} = req.body
  const account__number = generateAccountNumber();
  
try{
  const existingUser = await user.findOne({ pan });

  if(password !== confirm__password){
    return res.status(409).json({error: 'passwords does not match'})
  }
  else if (existingUser) {
    // If the user already exists, send an error response indicating that the email is taken
    return res.status(409).json({ error: 'user already exists' });
  }
  else{
    const registration = new user({
    firstName: first__name,
    accountNumber:account__number,
    lastName: last__name,
    email: email,
    phone:phone,
    password: password,
    confirmPassword: confirm__password,
    address: inputAddress,
    city: city,
    state: option,
    ammount:ammount,
    pan:pan,
    passportImg: req.files['passportImg'][0].filename,
    adharImg: req.files['adharImg'][0].filename,
  });


// MIDDLEWEARE : ACCESSING THE METHOD CREATED IN REGISTER.JS FOR CREATION THE TOKEN(JWT)
    const token = await registration.generateAuthToken()

        // res.cookie() is used to set the cookies name to value
        // the value parameter may be a string or an object converted to json

    console.log('token')
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 60000),
      httpOnly: true
    })

    console.log("token" + token)
     

  const result = await registration.save()
  

  const pass = req.files['passportImg'][0].filename
  console.log(pass)

  res.setHeader('Cache-Control', 'no-store');
  res.render('service',{
    firstName: first__name,
    lastName: last__name,
    accountNumber: account__number,
    ammount:ammount,
    passportImg:pass
  })
  }  }
  
  catch(e){
    console.log("failur")
  console.log(e)
  }
})


app.post('/login', async(req,res)=>{
  const {login__account__number,login__phone__number,login__password} = req.body;
  console.log(login__account__number)
  try{
    
  const result = await user.findOne({accountNumber:login__account__number})
  console.log(result)

  const isMatch = await bcrypt.compare(login__password, result.password)
  console.log(isMatch)
  if(result){
    if(result.phone == login__phone__number && isMatch){

      const token = await result.generateAuthToken()

      console.log("token:" + token)

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 60000),
      httpOnly: true
    })
    

        res.render('service',{
          firstName: result.firstName,
          lastName: result.lastName,
          accountNumber: result.accountNumber,
          ammount: result.ammount,
          passportImg:result.passportImg
        })
    }
    else{
      return res.send('invalid user cridentials')
    }
  }
}
catch(e){
  console.log(e)
}

})

app.post('/transfer',auth, async(req,res)=>{
  try{
  const {name,account__number,ammount} = req.body;


  const receiverAccount = await user.findOne({accountNumber:account__number})
  
  if(receiverAccount.firstName == name){
  if(req.user.ammount - ammount >= 2000){
    try{
      receiverAccount.ammount = receiverAccount.ammount + parseInt(ammount);
     await receiverAccount.save();
 
     req.user.ammount = req.user.ammount - ammount;
     await req.user.save()
    }
     catch(e){
      res.render('faliur',{
        error:"transaction failed"
      })
      console.log(e)
     }
  }
  else{
    res.render('faliur',{
      error:"Insufficient balance"
    })
  }
  }
  else{
    res.render('faliur',{
      error: "No such account exist with the account number exist"
    })
  }


  // getting current date in dd/mm/yy formate
const currentDate = new Date();

const day = String(currentDate.getDate()).padStart(2, '0');
const year = String(currentDate.getFullYear()).slice(-2);
const month = String(currentDate.getMonth() + 1).padStart(2, '0');
 
const date = `${day}/${year}/${month}`;


// getting current time in hh/mm/ss formate
const hours = String(currentDate.getHours()).padStart(2, '0');
const minutes = String(currentDate.getMinutes()).padStart(2, '0');
const seconds = String(currentDate.getSeconds()).padStart(2, '0');

const time = `${hours}/${minutes}/${seconds}`;


// storing transation detail to the database object of the sender
req.user.transactions = req.user.transactions.concat({to:account__number,date:date,time:time,ammount:ammount})

const saveTransactionTo = await req.user.save();
console.log(saveTransactionTo)


// storing transation detail to the database object of the receiver
receiverAccount.transactions = receiverAccount.transactions.concat({from:req.user.accountNumber,time:time,date:date,ammount:ammount})

const saveTransactionFrom = await receiverAccount.save();
console.log(saveTransactionFrom)


// sms to the sender
// const apiKey = "66c1fbe7";
// const apiSecret = 'A6gs57VpE11WlsFJ';
// const fromNumber = '9373123162';
// const toNumber = `${req.user.phone}`;
// console.log("toNumber" + toNumber)
// const message = `Rs.${ammount} Debited to A/c ${account__number.toString().slice(-4)}`;
// console.log(message)


// axios.post('https://rest.nexmo.com/sms/json', {
//   api_key: apiKey,
//   api_secret: apiSecret,
//   from: fromNumber,
//   to: toNumber,
//   text: message
// })
//   .then(response => {
//     console.log('SMS sent successfully');
//     console.log(response.data);
//   })
//   .catch(error => {
//     console.error('Failed to send SMS');
//     console.error(error);
//   });


  res.render('success', auth ,{
    fromAccount:req.user.accountNumber,
    fromFN:req.user.firstName,
    fromLN:req.user.lastName,
    toAccount:account__number,
    toFN: receiverAccount.firstName,
    toLN: receiverAccount.lastName,
    date:date,
    time:time,
    ammount:ammount
  })
  }
  catch(e){
    console.log(e)
  }
})


app.get('/', (req,res) => {
    res.render("index")
})

app.get('/new_account', (req,res)=>{
    res.render('new_account')
})

app.get('/service', auth , (req,res)=> {
  console.log(req.cookies.jwt)
  res.render('service')
})

app.get('/transaction', auth ,(req,res) => {
  res.render('transaction')
})

app.get('/switch', auth,(req,res)=> {
  res.render('switch')
})

app.get('/transaction__history',auth, (req,res) => {
  const transactions = req.user.transactions;
  res.render('transactionHistory', {
    transactions
  })
})

app.get('/logout', auth , async(req,res)=>{
  try{
  // req.user.tokens = req.user.tokens.filter((element)=>{
  //   return element.token !== req.token
  // })

  req.user.tokens = [];

  // res.clearCookie('jwt');
  res.clearCookie('jwt');
  console.log('logout sucessfully')
  await req.user.save();
  res.render('index')
  }
 catch(e){
  console.log(e);
 }
})


function generateAccountNumber() {
  const digits = '0123456789';
  let accountNumber = '';

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    accountNumber += digits.charAt(randomIndex);
  }

  return accountNumber;
}

app.listen(port, () => {
    console.log(`Listening to Port ${port}`)
})