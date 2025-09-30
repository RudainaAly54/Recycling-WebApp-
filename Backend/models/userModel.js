
// import mongoose from "mongoose";

// const userSchema=new mongoose.Schema({
//     name:{type:String,required:true},
//     email:{type:String,required:true ,unique:true},
//     password:{type:String,required:true},
//     verifyOtp: { type: String, default: "" },
//     verifyOtpExpireAt: { type: Number, default: 0 },
//     isAccountVerified: { type: Boolean, default: false },
//     resetOtp:{type:String,default:''},
//     resetOtpExpireAt:{type:Number,default:0},
// })
// const userModel=mongoose.models.user||mongoose.model('user',userSchema)
// // it will search for the user model if it is not avaliable create user modal 
// export default userModel;
// // store user data in mongodb database
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // 👈 خلي الـ email هو اللي unique
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;

