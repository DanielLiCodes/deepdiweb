
const bcrypt = require("bcrypt");
// import { Request, Response } from 'express';
const jwt = require("jsonwebtoken");
import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
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


module.exports = User;
// mongoose.connect(uri)

// var testUser = new User({
//     username: 'HAHAHA',
//     password: 'HAHAHAHAHAHA'
// });

// testUser.save();

