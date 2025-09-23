import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';

// user registeration
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    // check existing user
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create & save user
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();
    console.log(" User created:", user._id);

    // generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // email options
    const mailOptions = {
      from: `"Recycle App" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Welcome to BinWise",
      text: `Welcome to BinWise Website. Your account has been created with email id: ${email}`,
    };

    // send email safely
    try {
      await transporter.sendMail(mailOptions);
      console.log(" Email sent to:", email);
    } catch (mailErr) {
      console.error(" Email sending failed:", mailErr.message);
    }

    console.log("register finished");
    return res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error(" Register error:", error.message);
    return res.json({ success: false, message: error.message });
  }
};

// login function
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, message: 'Email and Password are required' })
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email" })
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" })
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.json({ success: true, message: "Login successful" });

  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

// log out
export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
    })
    return res.json({ success: true, message: 'Logged out' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// send verification OTP
export const sendVerifyOtp = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId); // ✅ take from middleware

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }

    // 6-digit random OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: `"Recycle App" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Account Verification OTP",
     // text: `Your OTP is ${otp}. Verify your account using this OTP.`,
      html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}" , user.email)
    };

    await transporter.sendMail(mailOption);

    res.json({ success: true, message: "Verification OTP sent to your email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// verify email with OTP
export const verifyEmail = async (req, res) => {
  const { otp } = req.body; // ✅ only OTP comes from body

  if (!otp) {
    return res.json({ success: false, message: "Missing OTP" });
  }

  try {
    const user = await userModel.findById(req.userId); // ✅ from middleware

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!user.verifyOtp || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const isAuthenticated = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      message: "User is authenticated",
      user,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// send reset passowrd otp
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: 'Email is required' })
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'Email not found' })
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: `"Recycle App" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Password reset OTP",
      text: `Your OTP is ${otp}. Reset your Password using this OTP.`,
      html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}" , user.email)
    };
    await transporter.sendMail(mailOption);

    return res.json({ success: true, message: 'OTP sent to your email' })
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

// reset user password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: 'Email, OTP and new Password are required' })
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" })
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" })
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    user.resetOtp = ''
    user.resetOtpExpireAt = 0
    await user.save()
    return res.json({ success: true, message: 'Password has been reset successfully' })
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

// import bcrypt from 'bcryptjs'
// import jwt from 'jsonwebtoken'
// import userModel from '../models/userModel.js';
// import transporter from '../config/nodemailer.js';
// // user registeration
// export const register = async (req, res) => {
//     const { name, email, password } = req.body;
  
//     if (!name || !email || !password) {
//       return res.json({ success: false, message: "Missing details" });
//     }
  
//     try {
//       // check existing user
//       const existingUser = await userModel.findOne({ email });
//       if (existingUser) {
//         return res.json({ success: false, message: "User already exists" });
//       }
  
//       // hash password
//       const hashedPassword = await bcrypt.hash(password, 10);
  
//       // create & save user
//       const user = new userModel({ name, email, password: hashedPassword });
//       await user.save();
//       console.log(" User created:", user._id);
  
//       // generate JWT
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//         expiresIn: "7d",
//       });
  
//       // set cookie
//       res.cookie("token", token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//       });
  
//       // email options
//       const mailOptions = {
//         from: `"Recycle App" <${process.env.SENDER_EMAIL}>`,
//         to: email,
//         subject: "Welcome to BinWise",
//         text: `Welcome to BinWise Website. Your account has been created with email id: ${email}`,
//       };
  
//       // send email safely
//       try {
//         await transporter.sendMail(mailOptions);
//         console.log(" Email sent to:", email);
//       } catch (mailErr) {
//         console.error(" Email sending failed:", mailErr.message);
//       }
  
//       console.log("register finished");
//       return res.json({ success: true, message: "User registered successfully" });
//     } catch (error) {
//       console.error(" Register error:", error.message);
//       return res.json({ success: false, message: error.message });
//     }
//   };
 
// // login function
// export const login=async(req,res)=>{
//     const{email,password}=req.body;
//     if(!email||!password){
//         return res.json({success:false,message:'Email and Password are required'})

//     }
//     try{
//         const user=await userModel.findOne({email});
//         if(!user){
//             return res.json({success:false, message:"Invalid email"})
//         }
//         const isMatch=await bcrypt.compare(password,user.password);
//         if(!isMatch){
//             return res.json({success:false, message:"Invalid password"})
//         }
//         const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})//when new user is created 1 id is automaticlly added
//         res.cookie('token',token,{
//             httpOnly:true,
//             secure:process.env.NODE_ENV==='production',
//             sameSite:process.env.NODE_ENV==='production'?'none':'strict',
//             maxAge:7*24*60*60*1000
//         })

        
//         return res.json({success:true, message:"Login successful"});

//     }catch(error){
//         return res.json({success:false,message:error.message})
//     }
// }

// // log out
// export const logout=async(req,res)=>{
//     try{
//         res.clearCookie('token',{
//             httpOnly:true,
//             secure:process.env.NODE_ENV==='production',
//             sameSite:process.env.NODE_ENV==='production'?'none':'strict'
//     })
//     return res.json({success:true,message:'Logged out'})

//     }catch(error){
//         res.json({success:false,message:error.message})

//     }
// }

// // send verification OTP
// export const sendVerifyOtp = async (req, res) => {
//     try {
//       const { userId } = req.body;
//       const user = await userModel.findById(userId);
  
//       if (!user) {
//         return res.json({ success: false, message: "User not found" });
//       }
  
//       if (user.isAccountVerified) {
//         return res.json({ success: false, message: "Account already verified" });
//       }
  
//       // 6-digit random OTP
//       const otp = String(Math.floor(100000 + Math.random() * 900000));
  
//       // use consistent field names
//       user.verifyOtp = otp;
//       user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
//       await user.save();
  
//       const mailOption = {
//         from: `"Recycle App" <${process.env.SENDER_EMAIL}>`,
//         to: user.email,
//         subject: "Account Verification OTP",
//         text: `Your OTP is ${otp}. Verify your account using this OTP.`,
//       };
  
//       await transporter.sendMail(mailOption);
  
//       res.json({ success: true, message: "Verification OTP sent to your email" });
//     } catch (error) {
//       res.json({ success: false, message: error.message });
//     }
//   };
  
//   // verify email with OTP
//   export const verifyEmail = async (req, res) => {
//     const { userId, otp } = req.body;
  
//     if (!userId || !otp) {
//       return res.json({ success: false, message: "Missing details" });
//     }
  
//     try {
//       const user = await userModel.findById(userId);
  
//       if (!user) {
//         return res.json({ success: false, message: "User not found" });
//       }
  
//       if (!user.verifyOtp || user.verifyOtp !== otp) {
//         return res.json({ success: false, message: "Invalid OTP" });
//       }
  
//       if (user.verifyOtpExpireAt < Date.now()) {
//         return res.json({ success: false, message: "OTP expired" });
//       }
  
//       user.isAccountVerified = true;
//       user.verifyOtp = "";
//       user.verifyOtpExpireAt = 0;
//       await user.save();
  
//       return res.json({ success: true, message: "Email verified successfully" });
//     } catch (error) {
//       res.json({ success: false, message: error.message });
//     }
//   };
// //   check if it is authentcatied or not
// // export const isAuthenticated=async(req,res)=>{
// //     try{
// //         return res.json({success:true});
// //     }catch(error){
// //         return res.json({success:false,message:error.message});

// //     }
// // }

// export const isAuthenticated = async (req, res) => {
//     try {
//       const user = await userModel.findById(req.userId).select("-password");
//       if (!user) {
//         return res.json({ success: false, message: "User not found" });
//       }
  
//       return res.json({
//         success: true,
//         message: "User is authenticated",
//         user,
//       });
//     } catch (error) {
//       return res.json({ success: false, message: error.message });
//     }
//   };
  

// //send reset passowrd otp
// export const sendResetOtp=async(req,res)=>{
//     const{email}=req.body;
//     if(!email){
//         return res.json({success:false,message:'Email is required'})
//     }
//     try{
//         const user=await userModel.findOne({email});
//         if(!user){
//             return res,json({success:false,message:'Email not found'})
//         }
//         const otp = String(Math.floor(100000 + Math.random() * 900000));
  
//         // use consistent field names
//         user.resetOtp = otp;
//         user.resetOtpExpireAt = Date.now() + 15* 60 * 1000; // 24 hours
//         await user.save();
//         const mailOption = {
//             from: `"Recycle App" <${process.env.SENDER_EMAIL}>`,
//             to: user.email,
//             subject: "Password reset  OTP",
//             text: `Your OTP is ${otp}.Reset your Password using this OTP.`,
//           };
//           await transporter.sendMail(mailOption);
//           return res.json({success:true,message:'OTP sent to your email'})
//     }catch(error){
//         return res.json({success:false,message:error.message})
//     }
// }

// //reset user password
// export const resetPassword=async(req,res)=>{
//     const{email,otp,newPassword}=req.body;
//     if(!email||!otp||!newPassword){
//         return res.json({success:false,message:'Email, OTP and new Password are required'})
//     }
//     try{
//         const user=await userModel.findOne({email});
//         if(!user){
//             return res.json({success:false,message:"User not found"})
            
//         }
//         if(user.resetOtp===""||user.resetOtp!==otp){
//             return res.json({success:false,message:"Invalid OTP"})
//         }
//         if(user.resetOtpExpireAt<Date.now()){
//             return res.json({success:false,message:"OTP Expired"})

//         }
//         const hashedPassword=await bcrypt.hash(newPassword,10)
//         user.password=hashedPassword
//         user.resetOtp=''
//         user.resetOtpExpireAt=0
//         await user.save()
//         return res.json({success:true,message:'Password has been reset successfully'})
//     }catch(error){

//         return res.json({success:false,message:error.message})

//     }
// }