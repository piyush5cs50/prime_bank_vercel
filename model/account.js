const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

require('dotenv').config()

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  accountNumber:{
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    // validate: {
    //     validator: function (value) {
    //       // Regular expression to validate email format
    //       const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    //       return emailRegex.test(value);
    //     },
    //     message: 'Invalid email format'
    //   }
  },

  phone:{
    type:Number,
    required:true
  },
  password: {
    type: String,
    required: true
  },
  confirmPassword: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 100,
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },

  passportImg: {
    type: String,
    required: true,

  },
  adharImg: {
    type: String,
    required: true,
  },
  ammount: {
    type: Number,
    require: true,

  },
  pan:{
    type:String,
    require:true,
    unique:true
  },
  tokens:[{
    token:{
        type:String,
        required:true
    }
  }
  ],
  transactions:[{
    to:{
      type:String
    },
    from:{
      type:String
    },
    date:{
      type:String,
      required:true
    },
    time:{
      type:String,
      required:true
    },
    ammount:{
      type:String,
      required:true
    }
  }] 
});


// CRATING THE MIDDLEWERE METHOD
userSchema.methods.generateAuthToken = async function(){
  try{
    const token = jwt.sign({_id:this._id}, process.env.USER_TOKEN)
    this.tokens = this.tokens.concat({token:token})
    const result = await this.save()
    return token;
  }
catch(e){
console.log(e)
}
}


userSchema.pre('save', async function(next){
  if(this.isModified('password')){
  this.password = await bcrypt.hash(this.password,10);
  this.confirmPassword = 'undefined'
  }
  next()
})

const User = mongoose.model('User', userSchema);

module.exports = User;
