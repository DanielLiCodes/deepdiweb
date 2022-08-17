
const bcrypt = require("bcrypt");
import { Request, response, Response } from 'express';
const jwt = require("jsonwebtoken");
import mongoose from 'mongoose';
var Schema = mongoose.Schema;
import axios from 'axios/index'
const API_ROOT_URL = process.env.API_ROOT_URL
const odaAxios = axios.create({ baseURL: API_ROOT_URL })
import {secret} from './login'


var UserSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    email: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true }
}).pre("save", function(this: any, next: any){
    var user = this;
    if(!user.isModified('password')) return;

    bcrypt.genSalt(10, function(err:any, salt:any) {
        if (err) return next(err);
        // hash the password along with our new salt
        bcrypt.hash(user.password, salt, function(err:any, hash:any) {
            if (err) return next(err);
    
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });

    // user.password = bcrypt.hashSync(user.password, 10);
});
async function comparePassword(user:any, candidatePassword:any, cb:any) {
    bcrypt.compare(candidatePassword, user.password, function(err:any, isMatch:any) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

const User = mongoose.model("User", UserSchema);

//create async function to create a new user and export it
export async function registerUser(req: Request, res: Response) {
    if(await checkEmail(req.body.params.email)){
        res.status(400).send("Email is already in use");
        return
    }
    if(await checkUsername(req.body.params.username)){
        res.status(400).send("Username is already in use");
        return
    }
    const user = new User({username: req.body.params.username, email: req.body.params.email, password: req.body.params.password});
    try {
        await user.save();
        res.send(user);
    } catch (e) {
        res.status(400).send(e);
    }
}

//function to check if email is in database already
export async function checkEmail(email: any) {
    try {
        const user = await User.findOne({email: email});
        if (user) {
            return true
        } else {
            return false
        }
    } catch (e) {
        console.log(e)
    }
}

export async function checkUsername(username: any) {
    try {
        const user = await User.findOne({username: username});
        if (user) {
            return true
        } else {
            return false
        }
    } catch (e) {
        console.log(e)
    }
}
//login function taking in email and pw as params for request
export async function loginUser(req: Request, res: Response) {
    let temp = await User.findOne({email: req.body.params.email});
    if(!temp){
        temp = await User.findOne({username: req.body.params.email});
    }
    const user = temp;
    if (!user) {
        res.status(401).send({error: "Username/Email not found"});
        return
    }else{
        try {
            await comparePassword(user, req.body.params.password, (err:any, isMatch:any) => {
                if (err) return res.status(401).send({error: "Password incorrect"});
                if (isMatch) {
                    const token = jwt.sign({email: user.email}, secret, {expiresIn: "3h"});
                    res.send({token: token});
                } else {
                    res.status(401).send({error: "Password incorrect"});
                }
            });
            
                // res.send(user);
        } catch (e) {
            console.log(e)
            res.status(401).send({error: "Password incorrect"});
        }
    }
}

export async function validateToken(req: Request, res: Response) {
    return jwt.verify(req.body.params.token, secret, function(err: any, decoded: any) {
        if (err) {
            res.status(401).send({error: err});
        } else {
            res.status(200).send({decoded: decoded});
        }
    });
}

// module.exports = User;
// mongoose.connect(uri)

// var testUser = new User({
//     username: 'HAHAHA',
//     password: 'HAHAHAHAHAHA'
// });

// testUser.save();

