const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const cookieParser=require("cookie-parser")
const UserModel = require("./models/User")

const app = express()
app.use(express.json())
app.use(cors( {
    origin:["http://localhost:3000"],
    methods:["GET","POST"],
    credentials:true
}))
app.use(cookieParser())

mongoose.connect('mongodb://127.0.0.1:27017/employee');
const varifyUser = (res,req,next)=>{
    const token=req.cookies.token;
    if(!token){
        return res.json("Token is missing")
    }else{
        jwt.verify(token,"jwt-secret-key",(err,decoded)=>{
            if(err){
                return res.json("error with token")
            }else{
                if(decoded.role==="admin"){
                    next()
                }else{
                    return res.json("not admin")
                }
            }
        })
    }
}
app.get('/dashboard',varifyUser,(res,req)=>{
    res.json("success")
})
app.post("/register",(req,res)=>{
    const{name,email,password}=req.body;
    bcrypt.hash(password,10)
    .then(hash=>{
            UserModel.create({name,email,password:hash})
            .then(user=>res.json(success))
            .catch(err=>res.json(err))
    }).catch(err=>res.json(err))
})
app.post("/login",(req,res)=>{
    const{email,password}=req.body;
    UserModel.findOne({email:email})
    .then(user=>{
        if(user){
            bcrypt.compare(password,user.password,(err,response)=>{
                if(response){
                    const token = jwt.sign({email:user.email,role:user.role},
                        "jwt-secret-key",{expiresIn:'1d'})
                        res.cookie('token',token)
                        return res.json({Status:'success',role:user.role})
                }else{
                    return res.json("The password is incorrect")
                }
            })
        }else{
            return res.json("No record existed")
        }
    })
})
app.listen(3001,()=>{
    console.log("Server is Running")
})