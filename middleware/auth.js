const jwt = require('jsonwebtoken')
const User = require('../model/account')


const auth = async(req,res,next)=>{
    try{
        console.log(req.cookies.jwt)
        const token = req.cookies.jwt;
        console.log(`jwt token ${token} saved token ${process.env.USER_TOKEN}`)
        const verifyUser = jwt.verify(token, process.env.USER_TOKEN)
      
        console.log(verifyUser)
        const user = await User.findOne({_id:verifyUser._id})
        console.log(user)
    
        req.user = user
        req.token = token
        next()
        }
        catch(e){
            res.status(500).send(e);
        }
}


module.exports = auth;