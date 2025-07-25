 const mongoose = require('mongoose');
 const bcrypt = require('bcryptjs');

 const UserSchema = new mongoose.Schema({
   name: {
     type: String,
     required: [true, 'Please enter your name']
   },
   email: {
     type: String,
     required: [true, 'Please enter your email'],
     unique: true
   },
   password: {
     type: String,
     required: [true, 'Please enter a password']
   },
   blocklist: {
     type: [String], // array of blocked domains
     default: []
   }
 }, { timestamps: true });

 // Hash password before saving
 UserSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next();
   const salt = await bcrypt.genSalt(10);
   this.password = await bcrypt.hash(this.password, salt);
   next();
 });

 // Match user entered password with hashed one
 UserSchema.methods.matchPassword = async function (enteredPassword) {
   return await bcrypt.compare(enteredPassword, this.password);
 };

 module.exports = mongoose.model('User', UserSchema);
