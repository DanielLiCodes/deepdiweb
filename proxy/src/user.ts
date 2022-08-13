
const bcrypt = require("bcrypt");
import { Request, Response } from 'express';
const jwt = require("jsonwebtoken");
import mongoose from 'mongoose';
var Schema = mongoose.Schema;
import axios from 'axios/index'
const API_ROOT_URL = process.env.API_ROOT_URL
const odaAxios = axios.create({ baseURL: API_ROOT_URL })

var UserSchema = new Schema({
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
UserSchema.methods.comparePassword = function(candidatePassword:any, cb:any) {
    bcrypt.compare(candidatePassword, this.password, function(err:any, isMatch:any) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

const User = mongoose.model("User", UserSchema);

//create async function to create a new user and export it
export async function registerUser(req: Request, res: Response) {
    const user = new User({email: req.body.params.email, password: req.body.params.password});
    try {
        await user.save();
        res.send(user);
    } catch (e) {
        res.status(400).send(e);
    }
}

export async function registerNewUsers (email:any, password:any) {
    await odaAxios.post('/odaweb/api/register', {
      params: {
        email: 'test',
        password: 'HAHAHA'
      }
    })
  }

// module.exports = User;
// mongoose.connect(uri)

// var testUser = new User({
//     username: 'HAHAHA',
//     password: 'HAHAHAHAHAHA'
// });

// testUser.save();

